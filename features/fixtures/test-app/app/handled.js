import React, { Component } from 'react'
import { View, Button } from 'react-native'
import Bugsnag from '@bugsnag/expo'

export default class Handled extends Component {

  constructor(props) {
    super(props)

    this.state.bugsnagClient = Bugsnag.createClient({
      endpoints: this.props.endpoints,
      autoTrackSessions: false
    })
  }

  handledError = () => {
    this.state.bugsnagClient.notify(new Error('HandledError'))
  }

  handledCaughtError = () => {
    try {
      throw new Error('HandledCaughtError');
    } catch (error) {
      this.state.bugsnagClient.notify(error);
    }
  }

  render() {
    return (
      <View>
        <Button accessibilityLabel="handledErrorButton"
          title="handledError"
          onPress={this.handledError}
        />
        <Button accessibilityLabel="handledCaughtErrorButton"
          title="handledCaughtError"
          onPress={this.handledCaughtError}
        />
      </View>
    )
  }
}