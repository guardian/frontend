@navigation
Feature: Navigation - Sections

In order to explore the Guardian content
As a Guardian Reader
I want to access all the sections across the Guardian site
 
	Scenario: Sections menu should slide down to open
		Given I visit an article
        When I click the "Sections" tab
        Then the "Sections" menu should open
  
	Scenario: Sections menu should slide up to close
        Given I visit an article
        	And the "Sections" menu is open
        When I click the "Sections" tab
        Then the "Sections" menu should close

 	@ignore
    Scenario: Section navigation is tracked with Omniture
        Given I interact with Section features using a mobile device, tablet or desktop
        When I track my visit using omniture
        Then Omniture will display data showing my interaction with each section tab