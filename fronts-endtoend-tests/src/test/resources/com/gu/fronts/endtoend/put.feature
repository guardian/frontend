Feature: As an editor I want to put storyA in the position of storyB in trailblockX

  Scenario: add new story
    Given trailblockX is an existing trailblock
    And storyB is part of it
    And storyA is not part of it
    When an editor puts storyA into trailblockX to the position of storyB
    Then storyA should be above storyB


  Scenario: modify order
    Given trailblockX is an existing trailblock
    And storyB is part of it
    And storyA is part of it
    And storyA is positioned below storyB
    When an editor puts storyA into trailblockX to the position of storyB
    Then storyA should be above storyB
