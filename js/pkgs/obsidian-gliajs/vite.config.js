import { resolve } from 'path'
import { defineConfig } from 'vite'

import commonjsExternals from 'vite-plugin-commonjs-externals'

const externals = ['path', 'fs']

export default defineConfig({
  build: {
    target: 'es2022',
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'obsidian-gliajs',
      formats: ['cjs'],
    },
    minify: false,
  },
  optimizeDeps: {
    exclude: externals,
  },
  plugins: [
    commonjsExternals({
      externals,
    }),
  ],
})
