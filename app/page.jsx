'use client';

import { useState } from 'react';
import { Card } from 'components/card';
import Head from 'next/head';

export default function ServerTimePage() {
  const [connectionTime, setConnectionTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverUrl, setServerUrl] = useState('https://bot.krowzie.uk');
  const [error, setError] = useState(null);
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [testType, setTestType] = useState('simple');

  const checkServerTime = async () => {
    setLoading(true);
    setError(null);
    setConnectionTime(null);
    setDownloadSpeed(null);

    try {
      // Basic connection time test
      const startTime = performance.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(serverUrl, { 
        method: testType === 'simple' ? 'HEAD' : 'GET', 
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-store' // Bypass cache for accurate results
      });
      
      const endTime = performance.now();
      setConnectionTime(endTime - startTime);
      clearTimeout(timeoutId);
      
      // If we're doing a comprehensive test, calculate download speed
      if (testType === 'comprehensive' && response.ok) {
        try {
          // For no-cors mode, we can't access the actual data
          // Using a second fetch with same URL but in cors mode if possible
          const secondController = new AbortController();
          const secondTimeoutId = setTimeout(() => secondController.abort(), 10000);
          
          const startDownload = performance.now();
          try {
            const dataResponse = await fetch(serverUrl, {
              cache: 'no-store',
              signal: secondController.signal,
            });
            
            if (dataResponse.ok) {
              const data = await dataResponse.blob();
              const endDownload = performance.now();
              
              // Calculate download speed in MB/s
              const sizeInBytes = data.size;
              const timeInSeconds = (endDownload - startDownload) / 1000;
              const speedMBps = (sizeInBytes / (1024 * 1024)) / timeInSeconds;
              
              setDownloadSpeed(speedMBps);
            }
          } catch (err) {
            // If CORS fails, we'll just show connection time
            console.log("Couldn't measure download speed:", err.message);
          } finally {
            clearTimeout(secondTimeoutId);
          }
        } catch (err) {
          console.log("Error measuring download speed:", err.message);
        }
      }
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
      <Head>
        <title>Server Connection Time</title>
      </Head>
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
              <select
                className="select"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
              >
                <option value="simple">Basic Test</option>
                <option value="comprehensive">Full Speed Test</option>
              </select>
              <button 
                className="btn" 
                onClick={checkServerTime} 
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Test Speed'}
              </button>
            </div>
            
            {connectionTime !== null && !error && (
              <div className="p-4 rounded-sm bg-primary text-primary-content text-center">
                <p className="text-2xl font-bold">{connectionTime.toFixed(2)} ms</p>
                <p className="text-sm">Connection time to {serverUrl}</p>
                
                {downloadSpeed !== null && (
                  <>
                    <hr className="my-2 border-primary-content/20" />
                    <p className="text-2xl font-bold">{downloadSpeed.toFixed(2)} MB/s</p>
                    <p className="text-sm">Download speed</p>
                  </>
                )}
              </div>
            )}
            
            {error && (
              <div className="p-4 rounded-sm bg-rose-400 text-neutral-900">
                {error}
              </div>
            )}
            
            <div className="text-sm text-neutral-400">
              <p>This tool measures connection time and download speed to the specified server.</p>
              <p><strong>Basic Test:</strong> Measures only connection establishment time</p>
              <p><strong>Full Speed Test:</strong> Attempts to measure both connection time and download speed</p>
              <p className="mt-1"><em>Note: Cross-origin restrictions may limit the accuracy of some measurements.</em></p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}