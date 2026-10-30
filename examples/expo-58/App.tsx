import Bugsnag from "@bugsnag/expo";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Controls from "./components/Controls";
import ErrorView from "./components/ErrorView";

Bugsnag.start();

// Create the error boundary...
const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React);

const onError = (event: any) => {
  // callback will only run for errors caught by boundary
}

export default function Index() {
  return (
    <ErrorBoundary FallbackComponent={ErrorView} onError={onError}>
      <View style={styles.screenContainer}>
        <Text>Expo example app</Text>
        <Controls />
      </View>
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
