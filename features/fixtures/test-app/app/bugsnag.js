import Bugsnag from '@bugsnag/expo'
import * as FileSystem from 'expo-file-system'

const endpoints = {
  notify: 'http://bs-local.com:9339/notify',
  sessions: 'http://bs-local.com:9339/sessions'
}

const getEndpoints = async () => {

  try {
    console.error("[BUGSNAG_TEST_FIXTURE] cacheDirectory:", FileSystem.cacheDirectory)
    console.error("[BUGSNAG_TEST_FIXTURE] documentDirectory:", FileSystem.documentDirectory)

    const contents = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory)
    console.error(`[BUGSNAG_TEST_FIXTURE] documentDirectory contents: ${contents.join(', ')}`)

    const fixtureConfigUri = FileSystem.documentDirectory + "fixture_config.json"
    const configStr = await FileSystem.readAsStringAsync(fixtureConfigUri)
    console.error("[BUGSNAG_TEST_FIXTURE] config file loaded", configStr)
    
    const config = JSON.parse(configStr)
    const mazeAddress = config.maze_address
    return {
      notify: `http://${mazeAddress}/notify`,
      sessions: `http://${mazeAddress}/sessions`
    }
  }
  catch (e) {
    console.error(`[BUGSNAG_TEST_FIXTURE] failed to load config file: ${e.message}`, e)
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
