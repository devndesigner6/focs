import { useEffect, useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { motion } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const Landing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(false);
  const [deviceType, setDeviceType] = useState<'windows' | 'mac' | 'android' | 'ios' | 'other'>('other');

  useEffect(() => {
    // Detect device type
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android')) setDeviceType('android');
    else if (ua.includes('iphone') || ua.includes('ipad')) setDeviceType('ios');
    else if (ua.includes('mac')) setDeviceType('mac');
    else if (ua.includes('win')) setDeviceType('windows');
    else setDeviceType('other');

    const media = window.matchMedia('(display-mode: standalone)');
    const computeInstalled = () => {
      const isStandalone = media.matches || (window.navigator as any).standalone;
      setInstalled(!!isStandalone);
    };
    computeInstalled();

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    const handleVisibility = () => computeInstalled();

    const handleDisplayModeChange = () => computeInstalled();

    media.addEventListener?.('change', handleDisplayModeChange);

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
      document.removeEventListener('visibilitychange', handleVisibility);
      media.removeEventListener?.('change', handleDisplayModeChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
        localStorage.setItem('focs-installed', 'true');
      }
      setInstallPrompt(null);
    } else {
      // Fallback: open PWA install instructions
      alert('If the install banner did not appear, use your browser menu to "Install app" or "Add to Home Screen".');
    }
  };

  const handleGoogleSignIn = async () => {
    if (!installed) {
      setError('Please install the app first before connecting your Google account.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Step 1: Sign in with Firebase (for user authentication)
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result.user) {
        // Step 2: Get OAuth access token using Google Identity Services
        const { requestGoogleAccessToken, GOOGLE_SCOPES } = await import('../services/googleToken');
        const accessToken = await requestGoogleAccessToken(GOOGLE_SCOPES);
        
        if (accessToken) {
          // Save user data and OAuth access token to Firestore
          await setDoc(
            doc(db, 'users', result.user.uid),
            {
              email: result.user.email || '',
              displayName: result.user.displayName || '',
              photoURL: result.user.photoURL || '',
              accessToken: accessToken,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } else {
          throw new Error('Failed to get Gmail/Calendar access token');
        }
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-[#0b0b0b] via-[#0f0f0f] to-[#0a0a0a]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: 'radial-gradient(800px at 20% 20%, #1f2a3a44, transparent), radial-gradient(900px at 80% 60%, #1a2f2244, transparent)' }} />
      
      {/* Wave background */}
      <div className="absolute bottom-0 left-0 right-0 opacity-20 pointer-events-none">
        <img src="/wave.png" alt="" className="w-full h-auto object-cover" style={{ mixBlendMode: 'screen' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-4xl mx-auto"
      >
        {/* Header / Logo */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-center"
        >
          <h1 className="text-6xl md:text-7xl font-light tracking-tight mb-3 text-dark-text">
            focs<span className="text-accent-blue">.</span>
          </h1>
          <p className="text-dark-muted text-lg md:text-xl mb-2">One screen. Zero chaos. Clear priorities every morning.</p>
          <p className="text-dark-muted text-base md:text-lg">Your day, sorted. Automatically.</p>
        </motion.div>

        {/* Headline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-base text-dark-muted mb-10 max-w-2xl mx-auto text-center leading-relaxed"
        >
          focs connects your tools and uses AI to surface priorities, decisions, and next actions so you can stay focused on what matters.
        </motion.p>

        {/* Connect Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-6"
        >
          {/* Step cards */}
          <div className="grid md:grid-cols-2 gap-5 text-left">
            <div className="p-6 rounded-3xl bg-[#111] border border-[#1f1f1f] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]">
              <p className="text-[11px] tracking-[0.25em] text-dark-muted mb-3">STEP 1</p>
              <h3 className="text-2xl font-medium mb-2 text-dark-text">Install focs</h3>
              <p className="text-sm text-dark-muted mb-4">Add focs as an app on your {deviceType === 'mac' ? 'Mac' : deviceType === 'windows' ? 'Windows PC' : deviceType === 'android' ? 'Android phone' : deviceType === 'ios' ? 'iPhone' : 'device'}.</p>
              <button
                onClick={handleInstallClick}
                disabled={installed}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white text-gray-900 hover:bg-gray-100 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-semibold">{installed ? '✓ Installed' : 'Install app'}</span>
                <span className="text-xs text-gray-700">{installed ? 'Ready' : installPrompt ? 'Click to install' : 'Use browser menu'}</span>
              </button>
              <div className="grid grid-cols-3 gap-2 text-xs text-dark-muted mt-4">
                <div className={`p-3 rounded-xl border ${deviceType === 'windows' ? 'bg-[#1f1f2f] border-accent-blue text-accent-blue' : 'bg-[#161616] border-[#1f1f1f]'}`}>Windows</div>
                <div className={`p-3 rounded-xl border ${deviceType === 'mac' ? 'bg-[#1f1f2f] border-accent-blue text-accent-blue' : 'bg-[#161616] border-[#1f1f1f]'}`}>Mac</div>
                <div className={`p-3 rounded-xl border ${deviceType === 'android' ? 'bg-[#1f1f2f] border-accent-blue text-accent-blue' : 'bg-[#161616] border-[#1f1f1f]'}`}>Android</div>
              </div>
              {!installed && (
                <p className="text-xs text-dark-muted mt-3 text-center">
                  ↑ Install first to unlock AI features
                </p>
              )}
            </div>

            <div className={`p-6 rounded-3xl bg-[#111] border shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] ${installed ? 'border-[#1f1f1f]' : 'border-[#1a1a1a] opacity-60'}`}>
              <p className="text-[11px] tracking-[0.25em] text-dark-muted mb-3">STEP 2</p>
              <h3 className="text-2xl font-medium mb-2 text-dark-text">Connect Gmail + Calendar</h3>
              <p className="text-sm text-dark-muted mb-5">Sync your inbox and calendar so focs can generate smart daily briefs.</p>
              <button
                onClick={handleGoogleSignIn}
                disabled={loading || !installed}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 px-6 py-3.5 rounded-2xl font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? 'Connecting...' : 'Connect with Google'}
              </button>
              {!installed && (
                <p className="text-xs text-orange-400 mt-3 text-center font-medium">
                  ⚠ Install app first (Step 1)
                </p>
              )}
              {installed && (
                <p className="text-xs text-dark-muted mt-3">AI will draft email replies for you to review and send.</p>
              )}
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm"
            >
              {error}
            </motion.p>
          )}

          <p className="text-sm text-dark-muted mt-6 text-center">
            {installed 
              ? 'App installed ✓ — Now connect your Google account to start.' 
              : 'Install the app first, then authenticate. Your emails stay private and secure.'}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Landing;
