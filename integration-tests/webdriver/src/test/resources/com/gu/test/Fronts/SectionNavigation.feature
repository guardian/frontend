@ignore
Feature: As Pete I want to expand, show or hide a section

  Scenario: clicking the expand button of a section
    Given Pete is viewing the front page
    When he expands a section
    Then more headlines in the section should appear

  Scenario: clicking the hide button of a section
    Given  Pete is viewing the front page
    When he hides a section
    Then the section should be hidden
    And hide should be replaced by show

  Scenario: clicking the show button of a section
    Given  Pete is viewing the front page
    And A section has been hidden
    When he shows a section
    Then the section should be displayed
    And show should be replaced by hide

  Scenario: clicking show/hide should be persistent
    Given Pete is viewing the front page
    And A section has been hidden
    When he refreshes the page
    Then the section should be hidden

