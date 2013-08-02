Feature: As an editor I want to delete story A from trailblockX

  Scenario: delete story from trailblock
    Given Bob is a trailblock editor
    And trailblockX is an existing trailblock
    And storyA is part of trailblockX
    When Bob deletes storyA from trailblockX
    Then trailblockX should not contain storyA
