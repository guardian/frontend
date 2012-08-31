Feature: Onwards journeys

Includes story packages and related links.

In order to continue reading more about the story 
As a Guardian reader
I want to visit related links to the current article I am reading

Measurements
------------
 
- Increase average number of articles 'read' from 1.9% to 2.5%

 Scenario: Visit related links
    Given I visit an article containing related links
    When I select a related link headline or image
    Then I should visit the corresponding article
 

 Scenario: Related links - non story package
    Given I visit an article containing related links
    When the article has no story package
    Then display 'Related content'
    And Maximum of 10 related links - show 5, hide 5 - 'show more'
    And Should have (optional) picture, link text, trail text
    And Hidden links should only have headline, trail text
    And Expanders should 'show more', then 'show less'
    And Number of 'more' items should be represented by a number
    And Each item in the list should contain a relative date stamp - Eg, 'published 1 minute/hour/day ago' 
 

 Scenario: Related links - Story package
    Given I visit an article containing related links
    When the article has a story package
    Then display 'more on this story'
    And if 7 or less related links are available show all
    And if more than 7 links are available show 5, hide remainder 'show more'
    And Should have (optional) picture, link text, trail text
    And Hidden links should only have headline, trail text
    And Expanders should 'show more', then 'show less'
    And Number of 'more' items should be represented by a number
    And Each item in the list should contain a relative date stamp - Eg, 'published 1 minute/hour/day ago'
    And links in the story package should *not* contain the current article (deduplicated)
  

 Scenario: Related links feature is tracked with Omniture
    Given I interact with related link features using a mobile device, tablet or desktop
    When I track my visit using omniture
    Then Omniture will display data showing my interaction with the related links

