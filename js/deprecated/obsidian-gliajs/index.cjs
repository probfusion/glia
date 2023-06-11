const modules = {
  utils: './utils.cjs',
  dom: './dom-manipulator.cjs',
}

// useful when developing. Use like `glia = glia.reload()`
const reload = () => {
  const glia = { reload: reload }
  for (const [name, relPath] of Object.entries(modules)) {
    delete require.cache[require.resolve(relPath)]
    glia[name] = require(relPath)
  }
  // define top-level properties after loading modules
  glia.renderTemplate = (app, dv, name) => {
    const template = glia.utils.getPageByName(app, dv, name)
    glia.dom.renderMd(template, dv)
  }
  return glia
}

module.exports = { ...reload() }
