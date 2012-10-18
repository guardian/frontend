@navigation
Feature: Navigation - Top Stories 

	In order to explore the latest Guardian stories 
	As a Guardian Reader
	I want to work through a list of the top stories per site section

    Scenario: Top stories tab shown on articles
    	Given I visit an article
        Then the "Top stories" tab is shown
    
    Scenario: Top stories tab shown on section fronts
    	Given I visit a section front
        Then the "Top stories" tab is shown

    Scenario: Top stories tab not shown on the network front
        Given I visit the network front
        Then the "Top stories" tab is hidden
    
    Scenario: Show 10 Top stories from the guardian site on a section front
        Given I visit an article
        When I click the "Top stories" tab
        Then I'm shown the top 10 stories from the Guardian site
        
    Scenario: Show 10 Top stories from the guardian site on an article   
        Given I visit a section front
        When I click the "Top stories" tab
        Then I'm shown the top 10 stories from the Guardian site

    Scenario: Top stories menu should open
        Given I visit an article
        When I click the "Top stories" tab
        Then the "Top stories" menu should open
    
    Scenario: Top stories menu should close
        Given I visit an article
        	And the "Top stories" menu is open
        When I click the "Top stories" tab
        Then the "Top stories" menu should close
    
    Scenario: Link to top story should work
        Given I visit an article
        	And the "Top stories" menu is open
        When I click on a top story
        Then I'm taken to that article
        
    Scenario: Links to top stories have a visited state
    	Given I visit an article
        	And the "Top stories" menu is open
        When I click on a top story
        	And the "Top stories" menu is open
        # NOTE - doesn't look like selenium can read 'visited' pseudo class styles
        # Then the top story link should have a color of rgba(119,119,119,1)
    
    @ignore
	Scenario: Top Stories navigation is tracked with Omniture
        Given I interact with Top stories feature using a mobile device, tablet or desktop
        When I track my visit using omniture
        Then Omniture will display data showing my interaction with Top Stories feature