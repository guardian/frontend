@articletest

Feature: Article page
	As a guardian mobile user
	I want to check available content is displayed on the article page
	So that I am able to browse all the article content correctly
	
  	Background:
    	Given I am on the home page 

	Scenario: More on this story
		When the article has a story package
		Then "more on this story" is displayed 

	Scenario: Article has no story package
		When the article has no story package
		Then "related content" is displayed
	
	#needs a page where content is not displayed
	#Scenario: Related content is unavailable
	#	When "related content" is unavailable
	#	Then "related content" is not displayed
	
	Scenario: Most read
		When I open a "sport" article
		Then "most read" section tab show read "sport"

	Scenario: Most read (per section)
		When I select sectional "Most read"
		Then I can see a list of the most popular stories on guardian.co.uk for the section I am in

	Scenario: Most read (pan-site)
		When I select pan-site "Most read"
		Then I can see a list of the most popular stories on guardian.co.uk for the whole guardian site

	Scenario: Open and close top story from top of page
		When I click "Top stories" tab at the top of the page
		Then a list of "Top stories" opens
		And another click on "Top stories" closes the list.

	Scenario: Open and close top story from foot of page
		When I click "Top stories" tab at the foot of the page
		Then a list of the footer "Top stories" opens
		And another click on the footer "Top stories" closes the list.
		
	Scenario: Open and close sections from top of page
		When I select the sections navigation button
		Then it should show me a list of sections

	Scenario: High resolution image and caption is displayed
		When the article has an article image
		And I have a fast connection speed
		Then the high resolution version of the image is displayed

	Scenario: Expand and collapse expanders on more on this story
		When "More on this story" has expanders
		Then I can expand and collapse expanders
 
 	#Scenario: Expand and collapse expanders on related content
	#	When "related content" has expanders
	#	Then I can expand and collapse expanders
		
	#Scenario: Expand and collapse expanders on related content
	#	Given I have visited some top stories
	#	When I click "Top stories" tab at the top of the page
	#	Then the articles I have visited will be in a visited state

@ In progress

         Scenario: Back to top
                When I click Back to top button
                Then article page scrolls quickly to the top

         Scenario: Page footer links
                When I click footer links (Desktop version, Help, Contact us, Feedback, T&C's and Pricacy policy)
                Then the corresponding pages are displayed



