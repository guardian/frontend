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

   Scenario: Maximum of 10 related links - show 5, hide 5 - 'show more'
   Scenario: Should have picture, link text, trail text
   Scenario: Hidden should only have headline, trail text
   Scenario: Expanders should 'show more', then 'show less'
   Scenario: Number of 'more' items should be represented by a number
   Scenario: Should appear *after* the comments 
   Scenario: If not Story Package then show Related Links
   Scenario: Each item in the list should contain a relative date stamp - Eg, 'published 1 minute ago' 
   Scenario: Links in the story package should *not* contain the current article (deduplicated)

