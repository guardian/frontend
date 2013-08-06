Feature: As an editor I want my changes to live trailblockX to be reflected in the draft version but not
  override any changes made to the draft version

  Scenario: managing conflicts
    Given trailblockX is an existing trailblock
    And StoryA is not part of it
    And StoryB is not part of it

    When an editor adds StoryB to the draft of trailblockX
    And she adds StoryA to trailblockX

    Then trailblockX draft should contain StoryA
    Then trailblockX draft should contain StoryB
    Then trailblockX should not contain StoryB
