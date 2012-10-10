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
		Then "related content" is displayed
	
	#needs a page where content is not displayed
	#Scenario: Related content is unavailable
	#	When "related content" is unavailable
	#	Then "related content" is not displayed
	
	Scenario: Most read
		When I open a "sport" article
		Then "most read" section tab show read "sport"

	Scenario: Toggle between tabs
		When I click the "Most read" tabs
		Then I can toggle between the section tab and guardian.co.uk tab

	Scenario: Open and close top story from top of page
		When I click "Top stories" tab at the top of the page
		Then a list of "Top stories" opens
		And another click on "Top stories" closes the list.

	Scenario: Open and close top story from foot of page
		When I click "Top stories" tab at the foot of the page
		Then a list of the footer "Top stories" opens
		And another click on the footer "Top stories" closes the list.
 
	Scenario: Open and close sections from top of page
		When I click the "header" "Sections" navigation tab
		Then a list of "Sections" opens in "header"
		And another click on the "header" "Sections" tab closes the list

	Scenario: Open and close sections from foot of page
		When I click the "footer" "Sections" navigation tab
		Then a list of bottom "Sections" opens in the "footer"
		And another click on the "footer" "Sections" tab closes the list

	Scenario: High resolution image and caption is displayed
		When the article has an article image
		Then article high resolution image and caption is displayed

	Scenario: Expand and collapse expanders on more on this story
		When "More on this story" has expanders
		Then I can expand and collapse expanders
 
 	Scenario: Expand and collapse expanders on related content
		When "related content" has expanders
		Then I can expand and collapse expanders
		
	Scenario: Expand and collapse expanders on related content
		Given I have visited some top stories
		When I click "Top stories" tab at the top of the page
		Then the articles I have visited will be in a visited state


