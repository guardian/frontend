Feature: Pivotal journey links

In order to continue reading more from the guardian
As a Guardian reader
I want to read other articles around the guardian website

Measurements
------------
 
- Target at page views with interactions on 'Most Read' area at 2%

   Scenario: Visit other stories in this section
    Given I visit an article within a specific section
    Then I should see the a list of articles within that section

	Scenario: Visit other stories across all sections
	Given I visit an article,
	Then I should see a list of other articles I may like across the Guardian
	
	Scenario: Toggle between section and guardian.co.uk links
	Scenario: Maximum of 10  links - show 5, hide 5 - 'show more'
   Scenario: Should have (optional) picture, link text, trail text
   Scenario: Hidden links should only have headline, trail text
   Scenario: Expanders should 'show more', then 'show less'
   Scenario: Number of 'more' items should be represented by a number
   Scenario: Appear *after* the related / package 
   Scenario: Each item in the list should contain a relative date stamp - Eg, 'published 1 minute/hour/day ago' 
   Scenario: Links in the story package should *not* contain the current article (deduplicated)
	
	

