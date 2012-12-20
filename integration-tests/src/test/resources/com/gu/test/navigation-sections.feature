@core-navigation @navigation-sections
Feature: Navigation - Sections

In order to explore the Guardian content
As a Guardian Reader
I want to access all the sections across the Guardian site

    Scenario: Sections tab shown on articles
    	Given I visit an article
        Then the "Sections" tab is shown
    
    Scenario: Sections tab shown on section fronts
    	Given I visit a section front
        Then the "Sections" tab is shown

    Scenario: Sections tab shown on the network front
        Given I visit the network front
        Then the "Sections" tab is shown
 
	Scenario: Sections menu should slide down to open
		Given I visit an article
        When I click the "Sections" tab
        Then the "Sections" menu should open
  
	Scenario: Sections menu should slide up to close
        Given I visit an article
        	And the "Sections" menu is open
        When I click the "Sections" tab
        Then the "Sections" menu should close

    Scenario: Sections menu should open on an article
        Given I visit an article
        When I click the "Sections" tab
        Then the "Sections" menu should open
    
    Scenario: Sections menu should close on an article
        Given I visit an article
        	And the "Sections" menu is open
        When I click the "Sections" tab
        Then the "Sections" menu should close

    Scenario: Sections menu should open on a section front
        Given I visit a section front
        When I click the "Sections" tab
        Then the "Sections" menu should open
    
    Scenario: Sections menu should close on a section front
        Given I visit a section front
        	And the "Sections" menu is open
        When I click the "Sections" tab
        Then the "Sections" menu should close

    Scenario: Sections menu should open on the network front
        Given I visit the network front
        When I click the "Sections" tab
        Then the "Sections" menu should open
    
    Scenario: Sections menu should close on the network front
        Given I visit the network front
        	And the "Sections" menu is open
        When I click the "Sections" tab
        Then the "Sections" menu should close