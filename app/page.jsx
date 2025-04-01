'use client';

import { useState, useEffect } from 'react';
import { Card } from 'components/card';

export const metadata = {
  title: 'Server Connection Time'
};

export default function ServerTimePage() {
  const [connectionTime, setConnectionTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverUrl, setServerUrl] = useState('https://bot.krowzie.uk');
  const [error, setError] = useState(null);

  const checkServerTime = async () => {
    setLoading(true);
    setError(null);
    try {
      const startTime = performance.now();
      
      // Using fetch with a timeout to measure connection time
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      await fetch(serverUrl, { 
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = performance.now();
      setConnectionTime(endTime - startTime);
    } catch (err) {
      setError(err.name === 'AbortError' 
        ? 'Connection timed out after 10 seconds' 
        : `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="mb-8">Server Connection Time</h1>
      <div className="flex flex-col gap-6 max-w-2xl">
        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="input flex-grow"
                placeholder="Enter server URL"
              />
              <button 
                className="btn" 
                onClick={checkServerTime} 
                disabled={loading}
              >
                {loading ? 'Checking...' : 'Check Connection'}
              </button>
            </div>
            
            {connectionTime !== null && !error && (
              <div className="p-4 rounded-sm bg-primary text-primary-content text-center">
                <p className="text-2xl font-bold">{connectionTime.toFixed(2)} ms</p>
                <p className="text-sm">Connection time to {serverUrl}</p>
              </div>
            )}
            
            {error && (
              <div className="p-4 rounded-sm bg-rose-400 text-neutral-900">
                {error}
              </div>
            )}
            
            <div className="text-sm text-neutral-400">
              <p>This tool measures the time it takes to establish a connection to the specified server.</p>
              <p>Note: For cross-origin requests, this measures connection time only and uses no-cors mode.</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}