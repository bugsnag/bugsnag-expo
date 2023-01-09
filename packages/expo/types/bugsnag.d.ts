import { BugsnagStatic, Config, Client } from '@bugsnag/core'

interface ExpoConfig extends Partial<Config> { 
  codeBundleId?: string 
}

interface ExpoBugsnagStatic extends BugsnagStatic {
  start(apiKeyOrOpts?: string | ExpoConfig): Client
  isStarted(): boolean
}

declare const Bugsnag: ExpoBugsnagStatic

export default Bugsnag
export * from '@bugsnag/core'
