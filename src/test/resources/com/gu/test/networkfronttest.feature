@networkfronttest

Feature: network front
	As a user
	I want to view the network front  
	So that I am able view stories
	
  	Background:
    	Given I am on the guardian network front

	Scenario: guardian logo and icon are displayed
		Then guardian icon is displayed
		And guardian logo is displayed

	Scenario: Sections tab is shown amd top stories are hidden
		Then "Top stories" tab is hidden
		And "Sections" tab is shown

	Scenario: can navigate to each section
		When I select each section in section tab
		Then I can navigate to each section
		And back to the network front
 
	Scenario: click to show and hide to expand and collapse each section 
		When I click "Hide" to collapse each section on the network front
		Then I can click "Show" to expand each section on the network front

	Scenario: collapsed section will remain collapsed on moving away from page
		Given I click "Hide" to collapse a section on the network front
		When I navigate to an article page and back to the network front
		Then the collapsed section will stay collapsed

	Scenario: collapsed section will remain collapsed on refresh
		Given I click "Hide" to collapse a section on the network front
		When I refresh the network front
		Then the collapsed section will stay collapsed

	Scenario: collapsed section will remain collapsed on moving to navigate to a section front
		Given I click "Hide" to collapse a section on the network front
		When I navigate to a section front
		Then the collapsed section will stay collapsed

	Scenario: Back to top returns me to the top
		When I scroll to the bottom of the page
		Then a click on "Back to top" returns me to the top

	Scenario: from rticle trail link can return to the network front
		When I click an article trail link in each section
		Then the article page is displayed
		And I can return to the network front	
		And click a trail link again to display the article page
	