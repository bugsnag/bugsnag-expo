Feature: Ignoring an event

Background:
  Given I clear any error dialogue
  And the element "ignoreEvent" is present
  And I click the element "ignoreEvent"

Scenario: A event can be ignored by returning false
  Given the element "ignoreEventFalseButton" is present
  When I click the element "ignoreEventFalseButton"
  Then I should receive no errors
