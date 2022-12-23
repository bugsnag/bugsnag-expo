import React, { Component } from 'react'
import { View, Button } from 'react-native'
import { endpoints } from './bugsnag'
import Bugsnag from '@bugsnag/expo'

export default class AppFeature extends Component {
  defaultApp = () => {
    bugsnagClient = Bugsnag.createClient({
      endpoints: endpoints,
      autoTrackSessions: false,
      codeBundleId: '691f4728-4bf5-4da3-a954-ea9a10fa17d2'
    })
    bugsnagClient.notify(new Error('HandledError'))
  }

  enhancedApp = () => {
    bugsnagClient = Bugsnag.createClient({
      endpoints: endpoints,
      autoTrackSessions: false,
      codeBundleId: '691f4728-4bf5-4da3-a954-ea9a10fa17d2'
    })
    bugsnagClient.notify(new Error('HandledError'), event => {
      event.app.releaseStage = 'enhancedReleaseStage'
      event.app.version = '5.5.5'
      event.app.type = 'custom app type'
      event.app.codeBundleId = '1.2.3'
    })
  }

  render() {
    return (
      <View>
        <Button accessibilityLabel="defaultAppButton"
          title="defaultApp"
          onPress={this.defaultApp}
        />
        <Button accessibilityLabel="enhancedAppButton"
          title="enhancedApp"
          onPress={this.enhancedApp}
        />
      </View>
    )
  }
}
