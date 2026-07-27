const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

const withFixSwiftWeakLet = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const iosDir = config.modRequest.platformProjectRoot
      const podfilePath = path.join(iosDir, 'Podfile')

      if (!fs.existsSync(podfilePath)) {
        console.log('[withFixSwiftWeakLet] Podfile not found, skipping')
        return config
      }

      let podfile = fs.readFileSync(podfilePath, 'utf8')

      const fixSnippet = `
    # [Swift 6 Fix] Set minimal concurrency and fix 'weak let' in Pod sources
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |bc|
        bc.build_settings['SWIFT_STRICT_CONCURRENCY'] = 'minimal'
      end
    end
    Dir.glob(File.join(__dir__, "Pods", "**", "*.swift")).each do |f|
      txt = File.read(f)
      if txt.include?("weak let")
        File.write(f, txt.gsub(/\\bweak\\s+let\\b/, "weak var"))
        Pod::UI.puts "  [Swift6Fix] Patched: \#{f}"
      end
    end`

      if (podfile.includes('post_install')) {
        // Inject after existing post_install opening
        podfile = podfile.replace(
          /post_install\s+do\s+\|installer\|/,
          `post_install do |installer|${fixSnippet}`
        )
      } else {
        // Add new post_install block before the final 'end' (end of target block)
        podfile += `\npost_install do |installer|${fixSnippet}\nend\n`
      }

      fs.writeFileSync(podfilePath, podfile)
      console.log('[withFixSwiftWeakLet] Podfile patched with Swift 6 fixes')
      return config
    }
  ])
}

module.exports = withFixSwiftWeakLet