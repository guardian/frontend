Feature: As an editor I want to be able to edit a draft of trailblockX

  Scenario: edit draft
    Given Bob is a trailblock editor
    And trailblockX is an existing trailblock
    When Bob edits the draft of trailblockX
    Then the live and draft version of trailblockX should not be the same
