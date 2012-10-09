@articletest

Feature: Article page
	As a guardian mobile user
	I want to check available content is displayed on the article page
	So that I am able to browse all the article content correctly
	
  	Background:
    	Given I am on an article page 

	Scenario: More on this story
		When the article has a story package
		Then "more on this story" is displayed 

	Scenario: Article has no story package
		When the article has no story package
		Then "related content" "is" displayed
	
	Scenario: Related content is unavailable
		When "related content" is unavailable
		Then "related content" "is not" displayed
	
	Scenario: Most read
		Then "most read" section tab correlates to the article section

	Scenario: Toggle between tabs
		When I click the "Most read" tabs
		Then I can toggle between the section tab and guardian.co.uk tab

	Scenario: Open and close top story from top of page
		When I click "Top stories" tab at the top of the page
		Then a list of "Top stories" opens
		And another click on "Top stories" closes the list.

	Scenario: Open and close top story from foot of page
		When I click "Top stories" tab at the foot of the page
		Then a list of "Top stories" opens
		And another click on "Top stories" closes the list.
 
	Scenario: Open and close sections from top of page
		And at the top of the page
		When I click the "Sections" navigation tab
		Then a list of "Sections" opens
		And another click on "Sections" tab closes the list

	Scenario: Open and close sections from foot of page
		And at the foot of the page
		When I click the "Sections" navigation tab
		Then a list of "Sections" opens
		And another click on "Sections" tab closes the list

	Scenario: More on this story
		When I click an article with article image
		Then the "article" page is displayed
		And the article will have an article image and caption
