Feature: As an editor I want to be able to put my draft of trailblockX live

  Scenario: publish draft
    Given Bob is a trailblock editor
    And trailblockX is an existing trailblock
    When Bob edits the draft of trailblockX
    And he publishes the draft of trailblockX
    Then the live version of trailblockX should be replaced by the draft version
