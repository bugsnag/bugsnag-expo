import React, { Component } from 'react'
import { View, Button } from 'react-native'
import { bugsnagClient } from './bugsnag'

export default class ManualBreadcrumbs extends Component {
  manualBreadcrumb = () => {
    bugsnagClient._breadcrumbs = []

    bugsnagClient.leaveBreadcrumb("manualBreadcrumb", { reason: "testing" })

    bugsnagClient.notify(new Error("ManualBreadcrumbError"))
  }

  render() {
    return (
      <View>
        <Button accessibilityLabel="manualBreadcrumbButton"
          title="manualBreadcrumb"
          onPress={this.manualBreadcrumb}
        />

        <Button
          title="this button somehow makes the test run, but otherwise doesn't do anything"
          onPress={() => {}}
        />
      </View>
    )
  }
}
