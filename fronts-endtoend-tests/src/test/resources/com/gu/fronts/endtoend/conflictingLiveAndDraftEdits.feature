Feature: As an editor I want my changes to live trailblockX to be reflected in the draft version but not
  override any changes made to the draft version

  Scenario: managing conflicts
    Given Bob is a trailblock editor
    And trailblockX is an existing trailblock
    When Bob edits the draft of trailblockX
    And he edits the live trailblockX
    Then the draft of trailblockX should reflect both modifications
