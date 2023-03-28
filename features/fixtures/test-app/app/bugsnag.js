import Bugsnag from '@bugsnag/expo'
import * as FileSystem from 'expo-file-system'

const endpoints = {
  notify: 'http://bs-local.com:9339/notify',
  sessions: 'http://bs-local.com:9339/sessions'
}

const getEndpoints = async () => {

  try {
    const fixtureConfigUri = FileSystem.documentDirectory + "fixture_config.json"
    const configStr = await FileSystem.readAsStringAsync(fixtureConfigUri)
    console.log("[BUGSNAG_TEST_FIXTURE] config file loaded", configStr)
    const config = JSON.parse(configStr)
    const mazeAddress = config.maze_address
    return {
      notify: `http://${mazeAddress}/notify`,
      sessions: `http://${mazeAddress}/sessions`
    }
  }
  catch (e) {
    console.log("[BUGSNAG_TEST_FIXTURE] failed to load config file", e)
    return Promise.resolve(endpoints)
  }
}

const bugsnagClient = Bugsnag.createClient({
  endpoints: endpoints,
  autoTrackSessions: false
})

export {
    endpoints,
    bugsnagClient,
    getEndpoints
}
