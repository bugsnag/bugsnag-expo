import React from 'react'
import { View, Text } from 'react-native'
import { bugsnagClient } from './bugsnag'

// Create the error boundary...
const ErrorBoundary = bugsnagClient.getPlugin('react').createErrorBoundary(React)

const onError = (event) => {
  // callback will only run for errors caught by boundary
}

const ErrorBoundaryFallback = ({ clearError }) => {
  return (
    <View accessibilityLabel="errorBoundaryFallback">
      <Text>Error Boundary Fallback</Text>
    </View>
  )
}

const text = function () { throw new Error("An error has occurred in Buggy component!") }

const App = () => {
  return (
    <View>
      <Text>Main Application</Text>
      <Text>{text()}</Text>
    </View>
  )
}

export default () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback} onError={onError}>
      <App />
    </ErrorBoundary>
  )
}
