import Bugsnag from '@bugsnag/expo';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

class BadButtons extends React.Component {
  constructor (props) {
    super(props)
    this.state = { yeah: false }
  }

  triggerRenderError = () => {
    this.setState({ yeah: true })
  }

  render() {
    return (
      <View>
        <AppButton onPress={handledError} title="Handled error"/>
        <AppButton onPress={unhandledError} title="Unhandled error"/>
        <AppButton onPress={this.triggerRenderError} title="Render error"/>
        {this.state.yeah ? <span>{ this.state.yeah.non.existent.property }</span> : null}
        <StatusBar style="auto" />
      </View>
    );
  }
}
export default BadButtons

function unhandledError() {
  throw new Error('Unhandled error!')
}

function handledError() {
  Bugsnag.notify(new Error('Handled error!'))
}

const AppButton = ({ onPress, title }) => (
  <View style={styles.buttonContainer}>
    <TouchableOpacity style={styles.button} onPress={onPress} >      
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#003366",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: 'white',
  },
  buttonContainer: {
    paddingVertical: 10,
  },
});