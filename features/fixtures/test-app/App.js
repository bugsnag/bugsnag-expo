import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Button, Text } from 'react-native'
import Handled from './app/handled'
import Unhandled from './app/unhandled'
import ErrorBoundary from './app/error_boundary'
import AppFeature from './app/app'
import AppStateBreadcrumbs from './app/app_state_breadcrumbs'
import UserFeature from './app/user'
import ConsoleBreadcrumbs from './app/console_breadcrumbs'
import IgnoreEvent from './app/ignore_event'
import MetadataFeature from './app/metadata'
import ManualBreadcrumbs from './app/manual_breadcrumbs'
import DeviceFeature from './app/device'
import Sessions from './app/sessions'
import NetworkBreadcrumbs from './app/network_breadcrumbs'
import FeatureFlags from './app/feature_flags'
import * as ScreenOrientation from 'expo-screen-orientation'
import { getEndpoints } from './app/bugsnag'

const SCENARIOS = [
  'handled',
  'unhandled',
  'errorBoundary',
  'appFeature',
  'appStateBreadcrumbs',
  'userFeature',
  'consoleBreadcrumbs',
  'ignoreEvent',
  'metadataFeature',
  'manualBreadcrumbs',
  'deviceFeature',
  'sessions',
  'networkBreadcrumbs',
  'featureFlags'
]

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      scenario: null,
      loaded: false,
      endpoints: {}
    }

    console.log("[BUGSNAG_TEST_FIXTURE] App Constructor")
    getEndpoints().then((endpoints) => {
      console.log("[BUGSNAG_TEST_FIXTURE] endpoints loaded", endpoints)
      this.setState({ endpoints: endpoints })
      return ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    }).then(() => this.setState({ loaded: true }))
  }

  renderScenario() {
    switch (this.state.scenario) {
      case 'handled':
        return <Handled endpoints={this.state.endpoints} />
      case 'unhandled':
        return <Unhandled />
      case 'errorBoundary':
        return <ErrorBoundary />
      case 'appFeature':
        return <AppFeature />
      case 'appStateBreadcrumbs':
        return <AppStateBreadcrumbs />
      case 'userFeature':
        return <UserFeature />
      case 'consoleBreadcrumbs':
        return <ConsoleBreadcrumbs />
      case 'ignoreEvent':
        return <IgnoreEvent />
      case 'metadataFeature':
        return <MetadataFeature />
      case 'manualBreadcrumbs':
        return <ManualBreadcrumbs />
      case 'deviceFeature':
        return <DeviceFeature />
      case 'sessions':
        return <Sessions />
      case 'networkBreadcrumbs':
        return <NetworkBreadcrumbs />
      case 'featureFlags':
        return <FeatureFlags />
    }
    return this.renderScenarioOptions()
  }

  renderScenarioOptions() {
    return SCENARIOS.map((scenario, index) => {

      return <Button accessibilityLabel={scenario}
                     key={index}
                     title={'Scenario: ' + scenario}
                     onPress={() => {
                       this.setState({ scenario })
                     }}/>
    })
  }

  render () {
    return (
      <View style={styles.container}>
        <View style={styles.child}>
          {this.state.loaded
            ? this.renderScenario()
            : <Text>Loading...</Text>
          }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '15%'
  },
  child: {
    flex: 1
  }
})
