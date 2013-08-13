Feature: As an editor I want to be able to discard my draft of trailblockX

  Scenario: discard draft
    Given trailblockX is an existing trailblock
    When an editor edits the draft of it
    And she discards the draft
    Then the draft version of trailblockX should be replaced by the live version
