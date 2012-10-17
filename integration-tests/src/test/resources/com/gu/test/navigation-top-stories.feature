@navigation
Feature: Navigation - Top Stories 

	In order to explore the latest Guardian stories 
	As a Guardian Reader
	I want to work through a list of the top stories per site section

    Scenario: Top stories link hidden on the network front
        Given I visit the network front
        Then "Top stories" tab is hidden

    Scenario: Top stories link shown on articles
    	Given I visit an article
        Then the "Top stories" tab is shown
        
    Scenario: Top stories link shown on section fronts
    	Given I visit a section front
        Then the "Top stories" tab is shown
    
    Scenario: Show 10 Top stories from the guardian site on a section front
        Given I visit an article
        When I click the "Top stories" tab
        Then I'm shown the top 10 stories from the Guardian site
        
    Scenario: Show 10 Top stories from the guardian site on an article   
        Given I visit a section front
        When I click the "Top stories" tab
        Then I'm shown the top 10 stories from the Guardian site
    
    Scenario: Links to top stories (visited state)
    	Given I visit a section front
    		And I click the "Top stories" tab
        When I have visited some stories within the top stories list
        Then the stories I have visited will have a visited state
                
    Scenario: Top stories menu should slide down to open
        Given I visit an article within a section, Or visit a section front and the Top stories menu is closed
        When I click on the Top stories link to open it
        Then the Top stories menu should slide down
               
    Scenario: Top stories menu should slide up to close
        Given I visit an article within a section, Or visit a section front and the Top stories menu is open
        When I click on the Top stories link to close it
        Then the Top stories menu should slide up
                 
    Scenario: Link to  Top story
        Given I have the Top stories menu open
        When I click on a Top story link
        Then I'm taken to the clicked article/story
    
	Scenario: Top Stories navigation is tracked with Omniture
        Given I interact with Top stories feature using a mobile device, tablet or desktop
        When I track my visit using omniture
        Then Omniture will display data showing my interaction with Top Stories feature