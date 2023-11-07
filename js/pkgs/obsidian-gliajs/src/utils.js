import * as fs from 'fs'
import * as Path from 'path'

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

export const initialCheck = (dv) => {
  dv.paragraph('Success: glia js library has been loaded as a global variable.')
}

export { readFile, noIndent, throwError, globalHas, getPageByName }
