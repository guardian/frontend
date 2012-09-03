Feature: Most read

In order to explore the most popular Guardian stories 
As a Guardian Reader
I want to read the most read stories across the guardian and within the section I'm in

Measurements

------------

- Interactions on the Most read area at the bottom of the page should be +2% of overall page views

    Scenario: Display Most Read in Article
              Given I visit an article
              When I scroll down to the Most Read section
              Then 2 tabs will be displayed (viewed section & Guardian.co.uk)
              And the viewed section tab will be pre-selected by default
              
    Scenario: Display Most Read in Section
	      Given I visit an article within a section
              When view and Interact with 'x section' tab
	      Then I will have 10 most read 'x section' links - show 5, hide 5 - 'show more'
	      And should have (optional) picture, link text, trail text
	      And hidden links should only have headline, trail text
	      And expanders should 'show more', then 'show less'
	      And number of 'more' items should be represented by a number
	      And each item in the list should contain a relative date stamp - Eg, 'published 1 minute/hour/day ago' 
	      And links should *not* contain the current article (deduplicated)
		
    Scenario: Display Most Read across Guardian
	      Given I visit an article within a section,
	      When view and Interact with 'Guardian.co.uk' tab	
              Then I will have 10 most read 'Guardian.co.uk' links - show 5, hide 5 - 'show more'
	      And should have (optional) picture, link text, trail text
	      And hidden links should only have headline, trail text
	      And expanders should 'show more', then 'show less'
	      And number of 'more' items should be represented by a number
	      And each item in the list should contain a relative date stamp - Eg, 'published 1 minute/hour/day ago' 
	      And links should *not* contain the current article (deduplicated)
		


    Scenario: Most Read feature is tracked with Omniture
              Given I interact with Most Read features using a mobile device, tablet or desktop
              When I track my visit using omniture
              Then Omniture will display data showing my interaction with Most Read features
