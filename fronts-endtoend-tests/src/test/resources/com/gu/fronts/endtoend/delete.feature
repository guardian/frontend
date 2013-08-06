Feature: As an editor I want to delete story A from trailblockX

  Scenario: delete story from trailblock
    Given trailblockX is an existing trailblock
    And storyA is part of it
    When an editor deletes storyA from it
    Then it should not contain storyA
