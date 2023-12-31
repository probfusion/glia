const Path = require('path')
const fs = require('fs')

// useful for de-indenting multiline template strings
const noIndent = (s) => s.replace(/^[^\S\r\n]+/gm, '')

// throws error with de-indented multiline template strings
const throwError = (errStr) => {
  throw new Error(noIndent(errStr))
}

const globalHas = (prop) => {
  return global?.[prop] ? true : false
}

const readFile = (path) => fs.readFileSync(path, 'utf8')

const getPageByName = (app, dv, name) => {
  const pagePath = Path.resolve(app.vault.adapter.basePath, dv.page(name).file.path)
  return readFile(pagePath)
}

module.exports = { readFile, noIndent, throwError, globalHas, getPageByName }
