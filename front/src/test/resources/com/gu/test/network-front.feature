Feature: Network front

    @ignore   
    Scenario: Trailblock exapnders
        Given I visit the front page
        Then expanders for each block should show a maximum of 5 stories

    @ignore
    Scenario: Texture
        Given a series of trailblocks network front 
        Then each block should obey the visual design rules
    
    @ignore     
    Scenario: Sections tab is shown and top stories are hidden
        Given I visit the front page
        Then "Top stories" tab is hidden
            And "Sections" tab is shown 

    Scenario: show and hide to expand and collapse each section
        Given I visit the front page 
        Then I can click "Hide" to collapse a section
            And I can click "Show" to expand a section

    @ignore
    Scenario: collapsed section will remain collapsed on moving away from page
        Given I visit the front page
            And I "Hide" to collapse a section on the network front
        When I navigate to an article page and back to the network front
        Then the collapsed section will stay collapsed

    @ignore
    Scenario: collapsed section will remain collapsed on refresh
        Given I visit the front page
            And I "Hide" to collapse a section on the network front
        When I refresh the network front
        Then the collapsed section will stay collapsed

    @ignore
    Scenario: collapsed section will remain collapsed on moving to navigate to a section front
        Given I visit the front page
            And I "Hide" to collapse a section on the network front
        When I navigate to a section front
        Then the collapsed section will stay collapsed
