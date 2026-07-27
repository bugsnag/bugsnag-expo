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

      // Ruby code to inject into post_install
      // This runs AFTER pod install resolves all pods into ios/Pods/
      const rubyFixCode = [
        '',
        '    # [Swift 6 Fix] Force Swift 5 language mode for pods with weak let',
        '    swift5_pods = ["ExpoModulesJSI", "ExpoModulesCore", "ExpoAppMetrics"]',
        '    installer.pods_project.targets.each do |target|',
        '      if swift5_pods.any? { |name| target.name.include?(name) }',
        '        target.build_configurations.each do |bc|',
        '          bc.build_settings["SWIFT_VERSION"] = "5.0"',
        '        end',
        '      end',
        '    end',
        '',
        '    # [Swift 6 Fix] Patch weak let -> weak var in ALL pod Swift sources',
        '    pods_root = installer.sandbox.root.to_s',
        '    patched = 0',
        '    Dir.glob(File.join(pods_root, "**", "*.swift")).each do |f|',
        '      content = File.read(f)',
        '      if content.include?("weak let")',
        '        File.write(f, content.gsub(/weak\\s+let/, "weak var"))',
        '        patched += 1',
        '      end',
        '    end',
        '    Dir.glob(File.join(pods_root, "**", "*.swiftinterface")).each do |f|',
        '      content = File.read(f)',
        '      if content.include?("weak let")',
        '        File.write(f, content.gsub(/weak\\s+let/, "weak var"))',
        '        patched += 1',
        '      end',
        '    end',
        '',
        '    # Also patch in node_modules (for development pods)',
        '    nm_path = File.expand_path("../node_modules", __dir__)',
        '    if File.directory?(nm_path)',
        '      Dir.glob(File.join(nm_path, "**", "*.swift")).each do |f|',
        '        content = File.read(f)',
        '        if content.include?("weak let")',
        '          File.write(f, content.gsub(/weak\\s+let/, "weak var"))',
        '          patched += 1',
        '        end',
        '      end',
        '      Dir.glob(File.join(nm_path, "**", "*.swiftinterface")).each do |f|',
        '        content = File.read(f)',
        '        if content.include?("weak let")',
        '          File.write(f, content.gsub(/weak\\s+let/, "weak var"))',
        '          patched += 1',
        '        end',
        '      end',
        '    end',
        '    Pod::UI.puts "[Swift6Fix] Patched #{patched} file(s)"',
        ''
      ].join('\n')

      // Find post_install block and inject after the opening line
      const postInstallRegex = /post_install\s+do\s+\|(\w+)\|/
      const match = podfile.match(postInstallRegex)

      if (match) {
        const insertPos = match.index + match[0].length
        podfile = podfile.slice(0, insertPos) + rubyFixCode + podfile.slice(insertPos)
        console.log('[withFixSwiftWeakLet] Injected fix into existing post_install block')
      } else {
        podfile += '\npost_install do |installer|' + rubyFixCode + '\nend\n'
        console.log('[withFixSwiftWeakLet] Added new post_install block with fix')
      }

      fs.writeFileSync(podfilePath, podfile)
      return config
    }
  ])
}

module.exports = withFixSwiftWeakLet