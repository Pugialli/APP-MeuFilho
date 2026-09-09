const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

config.resolver.unstable_enablePackageExports = true
config.resolver.unstable_conditionNames = ['require', 'default']

const originalResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // @hookform/resolvers subpaths (e.g. /zod, /yup) use package exports with
  // no "browser" condition — Metro falls back to this manual resolution.
  if (moduleName.startsWith('@hookform/resolvers/')) {
    const subpath = moduleName.slice('@hookform/resolvers/'.length)
    return {
      filePath: path.resolve(
        __dirname,
        `node_modules/@hookform/resolvers/${subpath}/dist/${subpath}.js`
      ),
      type: 'sourceFile',
    }
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform)
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
