Feature: As an editor I want to be able to edit live trailblockX directly

  Scenario: edit live
    Given Bob is a trailblock editor
    And trailblockX is an existing trailblock
    When Bob edits trailblockX
    Then trailblockX should be updated
