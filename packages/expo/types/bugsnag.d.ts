import { BugsnagStatic, Config, Client } from '@bugsnag/core'

type ExpoConfig = Partial<Config>
interface ExpoBugsnagStatic extends BugsnagStatic {
  start(apiKeyOrOpts?: string | ExpoConfig): Client
  isStarted(): boolean
}

declare const Bugsnag: ExpoBugsnagStatic

export default Bugsnag
export * from '@bugsnag/core'
