// const modules = {
//   utils: './utils.js',
//   dom: './dom-manipulator.js',
// }

// // useful when developing. Use like `glia = glia.reload()`
// const reload = () => {
//   const glia = { reload: reload }
//   for (const [name, relPath] of Object.entries(modules)) {
//     delete require.cache[require.resolve(relPath)]
//     glia[name] = require(relPath)
//   }
//   // define top-level properties after loading modules
//   glia.renderTemplate = (app, dv, name) => {
//     const template = glia.utils.getPageByName(app, dv, name)
//     glia.dom.renderMd(template, dv)
//   }
//   return glia
// }

import * as dom from './dom-manipulator.js'
import * as utils from './utils.js'

// export let drawn = {}

const renderTemplate = (app, dv, name) => {
  const template = utils.getPageByName(app, dv, name)
  // const path = dv.current().file.path
  // if (!drawn[path]) {
  //   dom.renderMd(template, dv)
  //   drawn[path] = true
  // }
  dom.renderMd(template, dv)
}

export { utils, dom, renderTemplate }
