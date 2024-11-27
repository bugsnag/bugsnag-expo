Feature: Error boundaries

Background:
  Given I clear any error dialogue
  And the element "errorBoundary" is present
  And I click the element "errorBoundary"

Scenario: A render error is captured by an error boundary
  Given I wait to receive an error
  Then the exception "errorClass" equals "Error"
  And the exception "message" starts with "An error has occurred in Buggy component!"
  And the event "metaData.react.componentStack" is not null
  And the error Bugsnag-Integrity header is valid
  And the element "errorBoundaryFallback" is present
