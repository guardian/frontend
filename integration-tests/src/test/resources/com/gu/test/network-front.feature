@network-front
Feature: Network front

    Scenario: Trailblock exapnders
        Given I visit the network front
        Then expanders for each block should show a maximum of 5 stories
        
    Scenario: Click show and hide to expand and collapse each section
        Given I visit the network front 
        Then I can click "Hide" to collapse a section
        	And I can click "Show" to expand a section

    Scenario: Collapsed section will remain collapsed on refresh
        Given I visit the network front
            And I hide a section
        When I refresh the page
        Then the collapsed section will stay collapsed
