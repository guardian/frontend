Feature: As an editor I want to be able to put my draft of trailblockX live

  Scenario: publish draft
    Given trailblockX is an existing trailblock
    When an editor edits the draft of it
    And she publishes the draft
    Then the live version of trailblockX should be replaced by the draft
