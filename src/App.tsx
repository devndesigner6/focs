import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Landing from './pages/Landing';
import Brief from './pages/Brief';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [forceBrief, setForceBrief] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const force = params.get('forceBrief');
    if (force === '1') {
      setForceBrief(true);
      setUser({ uid: 'dev', email: 'dev@example.com', displayName: 'Dev Mode' });
      setLoading(false);
      return; // Skip auth listener in dev force mode
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || undefined,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-dark-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {user ? <Brief user={user} /> : <Landing />}
    </div>
  );
}

export default App;
