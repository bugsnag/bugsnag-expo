import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

const bugsnag = require('bugsnag-expo')({
  apiKey: 'f35a2472bd230ac0ab0f52715bbdc65d'
})

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Bugsnag and Expo!</Text>
        <Button
          onPress={this.triggerHandledException}
          title="Cause handled exception from JS"
          accessibilityLabel="Cause handled exception from JS"
          color="#841584"/>
        <Button
          onPress={this.triggerUnhandledException}
          title="Cause unhandled exception from JS"
          accessibilityLabel="Cause unhandled exception from JS"
          color="#841584"/>
      </View>
    );
  }

  triggerHandledException() {
    bugsnag.notify(new RangeError('A handled exception from JS'));
  }

  triggerUnhandledException() {
    throw new TypeError('An unhandled exception from JS');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
