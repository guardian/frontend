Feature: As an editor I want to delete story A from trailblockX

  Scenario: delete story from trailblock
    Given trailblockX is an existing trailblock
    And storyA is part of trailblockX
    When an editor deletes storyA from the draft of trailblockX
    Then trailblockX should contain storyA
    Then trailblockX draft should not contain storyA
