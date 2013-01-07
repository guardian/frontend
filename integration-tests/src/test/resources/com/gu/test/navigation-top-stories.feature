 @core-navigation @navigation-top-stories
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

    #Ignoring this whilst we test whether people use this functionality in PROD
    @ignore 
    Scenario: Top stories tab not shown on the network front
        Given I visit the network front
        Then the "Top stories" tab is hidden

    Scenario: Top stories menu should open on an article
        Given I visit an article
        When I click the "Top stories" tab
        Then the "Top stories" menu should open
    
    Scenario: Top stories menu should close on an article
        Given I visit an article
        	And the "Top stories" menu is open
        When I click the "Top stories" tab
        Then the "Top stories" menu should close

    Scenario: Top stories menu should open on a section front
        Given I visit a section front
        When I click the "Top stories" tab
        Then the "Top stories" menu should open
    
    Scenario: Top stories menu should close on a section front
        Given I visit a section front
        	And the "Top stories" menu is open
        When I click the "Top stories" tab
        Then the "Top stories" menu should close
    
    Scenario: Show 10 Top stories from the guardian site on a section front
        Given I visit an article
        When I click the "Top stories" tab
        Then I'm shown the top 10 stories from the Guardian site
        
    Scenario: Show 10 Top stories from the guardian site on an article   
        Given I visit a section front
        When I click the "Top stories" tab
        Then I'm shown the top 10 stories from the Guardian site