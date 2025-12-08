/**
 * Client Launcher Utility
 * Handles launching the native Windows client or prompting download
 */

interface LaunchOptions {
  userId?: string;
  matchId?: string;
  token?: string;
}

/**
 * Attempts to launch the native Windows client via protocol handler
 * If the app is not installed, prompts user to download
 * @param options - Optional user and match information
 * @returns Promise<boolean> - true if likely installed, false if needs download
 */
export async function launchNativeClient(options?: LaunchOptions): Promise<boolean> {
  // Build protocol URL with parameters
  const params = new URLSearchParams();
  if (options?.userId) params.append('userId', options.userId);
  if (options?.matchId) params.append('matchId', options.matchId);
  if (options?.token) params.append('token', options.token);
  
  const protocolUrl = `eclip://launch${params.toString() ? '?' + params.toString() : ''}`;
  
  return new Promise((resolve) => {
    let resolved = false;
    
    // Try window.location first to get proper error handling
    try {
      // Create a temporary anchor to trigger protocol
      const link = document.createElement('a');
      link.href = protocolUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Listen for error (protocol not registered)
      link.addEventListener('error', () => {
        if (!resolved) {
          resolved = true;
          document.body.removeChild(link);
          resolve(false);
        }
      });
      
      // Click the link to trigger protocol
      link.click();
      
      // Set a timeout to check if the protocol worked
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          resolve(false);
        }
      }, 2000);

      // Listen for blur event (indicates app might have launched)
      const onBlur = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          setTimeout(() => {
            if (document.body.contains(link)) {
              document.body.removeChild(link);
            }
            resolve(true);
          }, 100);
          window.removeEventListener('blur', onBlur);
        }
      };

      window.addEventListener('blur', onBlur);

      // Fallback: if page becomes visible again quickly, app didn't launch
      const onFocus = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          setTimeout(() => {
            if (document.body.contains(link)) {
              document.body.removeChild(link);
            }
            resolve(false);
          }, 1500);
          window.removeEventListener('focus', onFocus);
        }
      };

      setTimeout(() => {
        window.addEventListener('focus', onFocus);
      }, 100);
      
    } catch (error) {
      // Protocol not registered or other error
      if (!resolved) {
        resolved = true;
        console.warn('Protocol launch failed:', error);
        resolve(false);
      }
    }
  });
}

/**
 * Downloads the native Windows client installer
 */
export function downloadClient() {
  const link = document.createElement('a');
  link.href = '/api/download/client';
  link.download = 'EclipAC-Setup.exe';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Checks if the user is on Windows
 */
export function isWindows(): boolean {
  return /Windows/i.test(navigator.userAgent);
}

/**
 * Main function to handle client launch with fallback to download
 * @param options - Optional user and match information
 */
export async function handleClientLaunch(options?: LaunchOptions): Promise<'launched' | 'download-started' | 'not-windows'> {
  // Check if user is on Windows
  if (!isWindows()) {
    return 'not-windows';
  }

  // Try to launch the native client
  const launched = await launchNativeClient(options);

  if (!launched) {
    // App not installed, start download
    downloadClient();
    return 'download-started';
  }

  return 'launched';
}
