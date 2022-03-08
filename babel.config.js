module.exports = api => {
  // NB: This function can be called without an api argument, e.g. by bin/bundle

  const presets = []
  const plugins = []
  const overrides = []

  if (api && !api.env('test')) {
    api.cache(false)
  }

  return { presets, plugins, overrides }
}
