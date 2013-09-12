Feature: As an editor I want to be able to copy storyA from trailblockX to trailblockY and trailblockZ

  Scenario: copying between trailblocks
    Given trailblockX is an existing trailblock
    And trailblockY is an existing trailblock
    And trailblockZ is an existing trailblock
    And storyA is part of trailblockX
    When an editor copies storyA to trailblockY
    And she copies storyA to trailblockZ
    Then trailblockX should contain storyA
    And trailblockY should contain storyA
    And trailblockZ should contain storyA
