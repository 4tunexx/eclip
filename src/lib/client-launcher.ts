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
    // Create a hidden iframe to trigger the protocol
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = protocolUrl;
    document.body.appendChild(iframe);

    // Set a timeout to check if the protocol worked
    const timeoutId = setTimeout(() => {
      // If we're still here after 2 seconds, the app probably isn't installed
      document.body.removeChild(iframe);
      resolve(false);
    }, 2000);

    // Listen for blur event (indicates app might have launched)
    const onBlur = () => {
      clearTimeout(timeoutId);
      setTimeout(() => {
        document.body.removeChild(iframe);
        resolve(true);
      }, 100);
      window.removeEventListener('blur', onBlur);
    };

    window.addEventListener('blur', onBlur);

    // Fallback: if page becomes visible again quickly, app didn't launch
    const onFocus = () => {
      clearTimeout(timeoutId);
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        resolve(false);
      }, 1500);
      window.removeEventListener('focus', onFocus);
    };

    setTimeout(() => {
      window.addEventListener('focus', onFocus);
    }, 100);
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
