Feature: As an editor I want to be able to discard my draft of trailblockX

  Scenario: discard draft
    Given Bob is a trailblock editor
    And trailblockX is an existing trailblock
    When he edits the draft of trailblockX
    And he discards the draft of trailblockX
    Then the draft version of trailblockX should be replaced by the live version
