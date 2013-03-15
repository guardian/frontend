@ARIA
Feature: ARIA landmarks
As an assistive technology user I want ARIA landmarks to assist with navigation
Scenario: Network Front
  Given I visit the network front
  Then "header" has a role of "banner"
  And "footer" has a role of "contentinfo"
  And "nav" has an aria-role of "navigation"
  And "nav" has an aria-label of "Guardian sections"