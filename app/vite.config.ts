import { defineConfig } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'

const config = defineConfig({
  server: {
    allowedHosts: ['timetracking.niteowl.dev'],
  },
  resolve: { tsconfigPaths: true },
  plugins: [tanstackStart(), viteReact()],
})

export default config
