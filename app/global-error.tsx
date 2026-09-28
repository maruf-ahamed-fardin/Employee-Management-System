'use client';

// Replaces the root layout when it fails, so it can't rely on the app's styles or providers
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'grid', placeItems: 'center', minHeight: '100dvh', margin: 0, background: '#f9fafb' }}>
        <main style={{ maxWidth: 420, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#252175', marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>SeloraX EMS couldn&apos;t load. Try again in a moment.</p>
          {error.digest && <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>Reference: {error.digest}</p>}
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 16, padding: '10px 20px', borderRadius: 9, border: 0, background: '#252175', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
