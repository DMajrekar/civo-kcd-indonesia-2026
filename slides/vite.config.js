import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import QRCode from 'qrcode'

// Build-time QR codes: the SVG is generated here and bundled as a string, so
// the deck makes no network calls at runtime.
function qrPlugin() {
  const id = 'virtual:qr'
  const resolved = '\0' + id
  return {
    name: 'kcd-qr',
    resolveId(source) {
      if (source === id) return resolved
    },
    async load(source) {
      if (source !== resolved) return
      const repo = 'https://github.com/DMajrekar/civo-kcd-indonesia-2026'
      const svg = await QRCode.toString(repo, {
        type: 'svg',
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000ff', light: '#ffffffff' },
      })
      // The voting app runs on the standby cluster behind a Civo reserved IP,
      // so this URL survives rebuilds. Changing it means rebuilding the deck.
      const votes = 'https://vote.49-128-189-194.sslip.io/'
      const votesSvg = await QRCode.toString(votes, {
        type: 'svg',
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000ff', light: '#ffffffff' },
      })
      // The JKT1 launch page, on the closing slide.
      const launch = 'https://civo.arupa.id'
      const launchSvg = await QRCode.toString(launch, {
        type: 'svg',
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000ff', light: '#ffffffff' },
      })
      return [
        `export const repoUrl = ${JSON.stringify(repo)};`,
        `export const repoQr = ${JSON.stringify(svg)};`,
        `export const votesUrl = ${JSON.stringify(votes)};`,
        `export const votesQr = ${JSON.stringify(votesSvg)};`,
        `export const launchUrl = ${JSON.stringify(launch)};`,
        `export const launchQr = ${JSON.stringify(launchSvg)};`,
        '',
      ].join('\n')
    },
    // React's production build embeds a docs URL in its error messages. It is
    // never fetched, but the deck should contain no external URL beyond the
    // ones it shows (repo, vote app, launch page).
    renderChunk(code) {
      return { code: code.replaceAll('https://react.dev/errors/', 'react.dev/errors/'), map: null }
    },
  }
}

export default defineConfig({
  plugins: [react(), qrPlugin()],
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 100000,
    modulePreload: { polyfill: false },
  },
})
