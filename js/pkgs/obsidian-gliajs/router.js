class Router {
  constructor(mode = 'local') {
    this.validModes = ['dev', 'local']
    if (!this.validModes.includes(mode)) {
      throw new Error(`mode must be one of '${this.validModes.join("', '")}', not '${mode}'.`)
    }
    this.mode = mode
    this.pkgDir = '/path/to/obsidian-gliajs/folder/'
    this.pkgEntry = 'obsidian-gliajs.cjs'
    this.pkgPath = `${this.pkgDir}${this.pkgEntry}`
  }

  loadPkg(pkg, mode) {
    switch (mode) {
      case 'dev': // fall through to local
        delete global.require.cache[global.require.resolve(pkg)]
      case 'local':
        return require(pkg)
      default:
        throw new Error(`mode must be one of '${this.validModes.join("', '")}', not '${mode}'.`)
    }
  }

  loadMain(mode = this.mode) {
    return this.loadPkg(this.pkgPath, mode)
  }
}
