Feature: Most read

In order to explore the most popular Guardian stories 
As a Guardian Reader
I want to read the most read stories across the guardian and within the section I'm in

Measurements

------------

- Interactions on the Most read area at the bottom of the page should be +2% of overall page views


    Scenario: Display Most Read in Section
		Given I visit an article within a section,
		Then I am shown the top 10 most read stories for the section I am in 
		
	Scenario: Display Most Read across Guardian
		Given I visit an article within a section,
		Then I am shown the top 10 most read stories for the section I am in
		
	Scenario: Remember tabs preference
		Given I have visited an article and chosen a tab in the most viewed section,
		Then the tab I have selected will persist on further pages I visit
		
	
	Scenario: 10 most read links - show 5, hide 5 - 'show more'
	   Scenario: Should have (optional) picture, link text, trail text
	   Scenario: Hidden links should only have headline, trail text
	   Scenario: Expanders should 'show more', then 'show less'
	   Scenario: Number of 'more' items should be represented by a number
	   Scenario: Appear *after* the comments 
	   Scenario: If has no Story Package, then show Related Links
	   Scenario: Each item in the list should contain a relative date stamp - Eg, 'published 1 minute/hour/day ago' 
	   Scenario: Links in the story package should *not* contain the current article (deduplicated)
		
