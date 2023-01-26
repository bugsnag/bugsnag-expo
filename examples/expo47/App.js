import Bugsnag from '@bugsnag/expo';
import React from 'react';
import BadButtons from './components/BadButtons';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image } from 'react-native';

const PlaceholderImage = require('./assets/favicon2-96.png');

Bugsnag.start();

const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React)

const onError = (event) => {
  // callback will only run for errors caught by boundary
}

const ErrorView = ({ clearError }) =>
  <View style={styles.screenContainer}>
    <Text>Inform users of an error in the component tree. 
    Use clearError to reset ErrorBoundary state and re-render child tree.</Text>
    <Button onPress={ clearError } title="Reset" />
  </View>

const App = () => {
  return (
    <View style={styles.screenContainer}>
      <Image source={PlaceholderImage}/>
      <Text style={styles.textContainer}>EXPO EXAMPLE APP</Text>
      <BadButtons />
    </View>
  )
};

export default () =>
  <ErrorBoundary FallbackComponent={ErrorView} onError={onError}>
    <App />
  </ErrorBoundary>

const styles = StyleSheet.create({
  screenContainer: {
    alignItems: "center",
    padding: 40,
  },
  textContainer: {
    paddingVertical: 20,
  },
});
