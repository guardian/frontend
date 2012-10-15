Feature: Network front

    Scenario: Trailblock exapnders
        Given I visit the network front
        Then expanders for each block should show a maximum of 5 stories

    Scenario: Sections tab is shown and top stories are hidden
        Given I visit the network front
        Then "Top stories" tab is hidden
            And "Sections" tab is shown 

    Scenario: show and hide to expand and collapse each section
        Given I visit the network front 
        Then I can click "Hide" to collapse a section
            And I can click "Show" to expand a section

    Scenario: collapsed section will remain collapsed on moving away from page
        Given I visit the network front
            And I hide a section
        When I navigate to an article page and back to the network front
        Then the collapsed section will stay collapsed
    
    Scenario: collapsed section will remain collapsed on refresh
        Given I visit the network front
            And I hide a section
        When I refresh the page
        Then the collapsed section will stay collapsed
