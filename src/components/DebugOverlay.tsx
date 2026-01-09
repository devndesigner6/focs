import { useEffect, useState } from 'react';

/** Dev-only overlay to align UI to a reference screenshot.
 * Usage: add ?overlay=/screenshots/<file> to URL in dev.
 */
export default function DebugOverlay() {
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.35);

  useEffect(() => {
    if (import.meta.env.PROD) return;
    const params = new URLSearchParams(window.location.search);
    const url = params.get('overlay');
    if (url) setOverlayUrl(url);
  }, []);

  if (!overlayUrl) return null;

  return (
    <div style={{ pointerEvents: 'none' }} className="fixed inset-0 z-[5]">
      <img src={overlayUrl} alt="overlay" className="w-full h-full object-contain" style={{ opacity }} />
      <div className="absolute bottom-4 right-4 text-xs text-white/70 bg-black/40 px-2 py-1 rounded">
        Overlay active — adjust with &opacity=0-1
      </div>
    </div>
  );
}
