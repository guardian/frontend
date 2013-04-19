@story @ignore
Feature: Story page
  As a guardian mobile user
  I want to check available content is displayed on the story page
  So that I am able to browse all the story content correctly

  Scenario: Latest developments
    Given I am on an story
    Then Latest developments is displayed
    And the first 2 blocks from article is shown

  Scenario: Timeline
    Given I am on an story
    Then a "timeline" of events is displayed

  @ignore
  Scenario: Latest stories package
    Given I am on an story
    Then Latest stories is displayed

  Scenario: Back to top
    Given I am on an story
    When Back to top is selected
    Then page scrolls to the top
