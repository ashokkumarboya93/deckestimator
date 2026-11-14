// ============================================================================
// DECK RESTORATION PLUS — SHARED LIVE DEMO ENGINE & PRESENTER HUD
// ============================================================================
// Powers video-quality automated live demos with:
// 1. Crystal-clear Microsoft David / Mark speech synthesis (never cuts off)
// 2. Edited-video style lower-third cinema captions with animated audio waves
// 3. Spotlight highlights on key UI elements
// 4. Fluid 100% full-screen maximized viewport (zero half-screen issues)
// ============================================================================

const path = require('path');
const puppeteer = require(path.resolve(__dirname, 'backend/node_modules/puppeteer-core'));

const BASE_URL = 'http://localhost:5173';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createDemoSession(videoTitle) {
  console.log('================================================================');
  console.log(`  STARTING DEMO RECORDING: ${videoTitle.toUpperCase()}  `);
  console.log('================================================================');
  console.log('Launching maximized Chrome with crystal-clear voiceover...');

  const isHeadless = process.env.DEMO_HEADLESS === '1' || process.argv.includes('--headless') ? 'new' : false;
  const isMuted = process.env.DEMO_MUTE === '1' || process.argv.includes('--mute');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: isHeadless,
    defaultViewport: isHeadless ? { width: 1440, height: 900 } : null,
    args: [
      '--start-maximized',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-notifications',
      '--no-default-browser-check',
      '--disable-infobars',
      ...(isMuted ? ['--mute-audio'] : []),
    ],
  });

  const [page] = await browser.pages();
  await page.bringToFront().catch(() => {});

  // Bring Chrome above terminal/IDE on Windows desktop runs (retries while Chrome creates its window)
  if (!isHeadless && process.platform === 'win32' && browser.process()?.pid) {
    const { execFile } = require('child_process');
    const chromePid = browser.process().pid;
    const ps = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class DemoWinFocus {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  public static bool Focus(uint pid) {
    bool ok = false;
    EnumWindows((hWnd, lParam) => {
      if (!IsWindowVisible(hWnd)) return true;
      uint wp; GetWindowThreadProcessId(hWnd, out wp);
      if (wp == pid) {
        ShowWindow(hWnd, 3);
        SetWindowPos(hWnd, new IntPtr(-1), 0, 0, 0, 0, 0x0043);
        SetWindowPos(hWnd, new IntPtr(-2), 0, 0, 0, 0, 0x0043);
        SetForegroundWindow(hWnd);
        ok = true;
        return false;
      }
      return true;
    }, IntPtr.Zero);
    return ok;
  }
}
"@
for ($i = 0; $i -lt 15; $i++) {
  if ([DemoWinFocus]::Focus(${chromePid})) { break }
  Start-Sleep -Milliseconds 200
}
`;
    execFile('powershell.exe', ['-NoProfile', '-Command', ps], () => {});
  }

  page.on('dialog', async (dialog) => {
    console.log(`[Dialog Auto-Accepted] ${dialog.message()}`);
    await dialog.accept().catch(() => {});
  });

  // Inject cinema-grade lower-third presenter HUD
  async function setupCinemaHUD() {
    await page.evaluate((vTitle) => {
      if (document.getElementById('cinema-presenter-hud')) return;

      const hud = document.createElement('div');
      hud.id = 'cinema-presenter-hud';
      hud.style.position = 'fixed';
      hud.style.bottom = '28px';
      hud.style.left = '50%';
      hud.style.transform = 'translateX(-50%)';
      hud.style.zIndex = '9999999';
      hud.style.backgroundColor = 'rgba(7, 19, 39, 0.95)';
      hud.style.backdropFilter = 'blur(16px)';
      hud.style.webkitBackdropFilter = 'blur(16px)';
      hud.style.border = '1px solid rgba(224, 129, 49, 0.55)';
      hud.style.boxShadow = '0 20px 48px rgba(0, 0, 0, 0.55), 0 0 25px rgba(224, 129, 49, 0.2)';
      hud.style.borderRadius = '16px';
      hud.style.padding = '14px 24px';
      hud.style.maxWidth = '920px';
      hud.style.width = 'calc(100% - 80px)';
      hud.style.color = '#FFFFFF';
      hud.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      hud.style.display = 'flex';
      hud.style.alignItems = 'center';
      hud.style.justifyContent = 'space-between';
      hud.style.gap = '20px';
      hud.style.pointerEvents = 'none';
      hud.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';

      hud.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:4px; flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="display:flex; align-items:center; gap:6px; background:rgba(224,129,49,0.18); border:1px solid rgba(224,129,49,0.4); padding:2px 10px; border-radius:30px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px #22c55e;"></span>
              <span id="cinema-hud-tag" style="font-size:11px; font-weight:800; color:#F59E0B; letter-spacing:0.08em; text-transform:uppercase;">LIVE DEMO</span>
            </div>
            <span style="font-size:12px; font-weight:600; color:#94A3B8; letter-spacing:0.02em;">${vTitle}</span>
          </div>
          <div id="cinema-hud-caption" style="font-size:15px; font-weight:600; color:#F8FAFC; line-height:1.45; letter-spacing:0.01em; text-shadow:0 1px 2px rgba(0,0,0,0.5);">
            Deck Restoration Plus Official Demonstration
          </div>
        </div>

        <!-- Animated Audio Waveform Visualizer -->
        <div id="cinema-audio-waves" style="display:flex; align-items:center; gap:4px; height:24px; padding-left:14px; border-left:1px solid rgba(255,255,255,0.15);">
          <span style="width:3px; height:8px; background:#E08131; border-radius:2px; animation:wave 1s ease-in-out infinite;"></span>
          <span style="width:3px; height:18px; background:#E08131; border-radius:2px; animation:wave 1s ease-in-out infinite 0.2s;"></span>
          <span style="width:3px; height:12px; background:#E08131; border-radius:2px; animation:wave 1s ease-in-out infinite 0.4s;"></span>
          <span style="width:3px; height:22px; background:#E08131; border-radius:2px; animation:wave 1s ease-in-out infinite 0.1s;"></span>
          <span style="width:3px; height:10px; background:#E08131; border-radius:2px; animation:wave 1s ease-in-out infinite 0.3s;"></span>
        </div>

        <style>
          @keyframes wave {
            0%, 100% { transform: scaleY(0.4); }
            50% { transform: scaleY(1.2); }
          }
        </style>
      `;

      document.body.appendChild(hud);
    }, videoTitle);
  }

  // Clear, complete voice narration using Web Speech API with zero mid-sentence cutoff
  async function speak(tag, caption, postPauseMs = 600) {
    console.log(`[${tag}] ${caption}`);
    await setupCinemaHUD();

    await page.evaluate(
      (t, c) => {
        return new Promise((resolve) => {
          const tagEl = document.getElementById('cinema-hud-tag');
          const capEl = document.getElementById('cinema-hud-caption');
          if (tagEl) tagEl.innerText = t;
          if (capEl) capEl.innerText = c;

          if (!window.speechSynthesis) {
            return setTimeout(resolve, 2500);
          }

          window.speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(c);
          utterance.rate = 0.98; // Natural, clear presenter speed
          utterance.pitch = 1.0;

          // Select clearest US English voice
          const voices = window.speechSynthesis.getVoices();
          const targetVoice =
            voices.find((v) => v.name.includes('David')) ||
            voices.find((v) => v.name.includes('Mark')) ||
            voices.find((v) => v.name.includes('Google US English')) ||
            voices.find((v) => v.name.includes('Zira')) ||
            voices.find((v) => v.lang.startsWith('en'));

          if (targetVoice) utterance.voice = targetVoice;

          // Prevent Chromium garbage-collection bug
          window._cinemaUtterance = utterance;

          let finished = false;
          utterance.onend = () => {
            if (!finished) {
              finished = true;
              resolve();
            }
          };
          utterance.onerror = () => {
            if (!finished) {
              finished = true;
              resolve();
            }
          };

          // Safety fallback timeout
          setTimeout(() => {
            if (!finished) {
              finished = true;
              resolve();
            }
          }, 12000);

          window.speechSynthesis.speak(utterance);
        });
      },
      tag,
      caption
    );

    await sleep(postPauseMs);
  }

  // Smooth cinematic auto-scroll
  async function smoothScrollTo(selectorOrY, durationMs = 1200) {
    await page.evaluate(
      async (target, duration) => {
        let targetY = 0;
        if (typeof target === 'string') {
          const el = document.querySelector(target);
          if (el) targetY = el.getBoundingClientRect().top + window.pageYOffset - 90;
        } else {
          targetY = target;
        }

        const startY = window.pageYOffset;
        const diff = targetY - startY;
        const startTime = performance.now();

        await new Promise((resolve) => {
          function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            window.scrollTo(0, startY + diff * ease);
            if (progress < 1) requestAnimationFrame(step);
            else resolve();
          }
          requestAnimationFrame(step);
        });
      },
      selectorOrY,
      durationMs
    );
    await sleep(350);
  }

  // Spotlight highlight animation on key elements
  async function spotlight(selector, durationMs = 2600) {
    await page.evaluate(
      (sel, duration) => {
        const el = document.querySelector(sel);
        if (!el) return;
        const prevShadow = el.style.boxShadow;
        const prevTransition = el.style.transition;
        el.style.transition = 'all 0.4s ease';
        el.style.boxShadow = '0 0 0 3.5px #E08131, 0 12px 35px rgba(224, 129, 49, 0.45)';
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          el.style.boxShadow = prevShadow;
          el.style.transition = prevTransition;
        }, duration);
      },
      selector,
      durationMs
    );
    await sleep(400);
  }

  // Scroll active form element into center view
  async function centerActiveForm() {
    await page.evaluate(() => {
      const formEl = document.querySelector('form') || document.querySelector('input');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await sleep(400);
  }

  // Clear storage & cookies so switching portals never retains prior user session
  async function clearSession() {
    await page.evaluate(async () => {
      try {
        await fetch('http://localhost:5000/api/v1/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch {}
      try { localStorage.clear(); } catch {}
      try { sessionStorage.clear(); } catch {}
    });
    try {
      const client = await page.createCDPSession();
      await client.send('Network.clearBrowserCookies');
      await client.detach().catch(() => {});
    } catch {}
    await sleep(300);
  }

  return {
    browser,
    page,
    BASE_URL,
    speak,
    smoothScrollTo,
    spotlight,
    centerActiveForm,
    clearSession,
    sleep,
  };
}

module.exports = { createDemoSession, sleep };

