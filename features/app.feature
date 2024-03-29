Feature: Expo App data

Background:
  Given I clear any error dialogue
  And the element "appFeature" is present
  And I click the element "appFeature"

Scenario: App data is included by default
  Given the element "defaultAppButton" is present
  When I click the element "defaultAppButton"
  Then I wait to receive an error
  And the event "app.releaseStage" equals "production"
  And the event "app.version" equals "2.0.0"
  And the event "app.duration" is not null
  And the event "app.durationInForeground" is not null
  And the event "app.inForeground" is true
  And the event "app.type" equals the current OS name
  And the event "app.codeBundleId" equals "691f4728-4bf5-4da3-a954-ea9a10fa17d2"
  And the error Bugsnag-Integrity header is valid
  # Parameter not present on iOS devices
  And the event "app.versionCode" equals the platform-dependent string:
    | android | 1     |
    | ios     | @null |
  # Parameter not present on Android devices
  And the event "app.bundleVersion" equals the platform-dependent string:
    | android | @null |
    | ios     | 1     |

Scenario: App data can be modified by a callback
  Given the element "enhancedAppButton" is present
  When I click the element "enhancedAppButton"
  Then I wait to receive an error
  And the event "app.releaseStage" equals "enhancedReleaseStage"
  And the event "app.version" equals "5.5.5"
  And the event "app.duration" is not null
  And the event "app.durationInForeground" is not null
  And the event "app.inForeground" is true
  And the event "app.type" equals "custom app type"
  And the event "app.codeBundleId" equals "1.2.3"
  And the error Bugsnag-Integrity header is valid
