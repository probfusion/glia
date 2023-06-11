const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.js'),
      name: 'obsidian-gliajs',
      fileName: (format) => `obsidian-gliajs.${format}.js`
    }
  }
});