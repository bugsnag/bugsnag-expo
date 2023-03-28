import Bugsnag from '@bugsnag/expo'
import * as FileSystem from 'expo-file-system'

const endpoints = {
  notify: 'http://bs-local.com:9339/notify',
  sessions: 'http://bs-local.com:9339/sessions'
}

const getEndpoints = async () => {
  const fixtureConfigUri = FileSystem.documentDirectory + "fixture_config.json"
  const configStr = await FileSystem.readAsStringAsync(fixtureConfigUri)
  const config = JSON.parse(configStr)
  const mazeAddress = config.maze_address
  return {
    notify: `http://${mazeAddress}/notify`,
    sessions: `http://${mazeAddress}/sessions`
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
