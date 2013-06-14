@discussion
Feature: Read comments
    As a Guardian reader
    I want to read comments
    So I can engage with other users

  Scenario: Read top level comments
    Given I am on an article with comments
    When I choose to view the comments
    Then the main image has a toggle class applied to it
    Then I can see 10 top level comments
    And the first comment is authored by "timecop"
    And the first comment body contains "Get used to it. This apparently is how the world works today."
    When I show more comments
    Then I can see 20 top level comments
