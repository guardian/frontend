@front  @network-front
Feature: Network front

    Scenario: A maximum of 5 stories are hidden in the expander
        Given I visit the network front
        Then expanders for each block should show a maximum of 5 stories
         
    Scenario: Users can hide sections
        Given I visit the network front 
        When I hide a section
        Then the section will be hidden
    
    Scenario: Users can show hidden sections
        Given I visit the network front
            And a section is hidden 
        When I show a section
        Then the section will be shown

    Scenario: Hidden section will remain hidden on refresh
        Given I visit the network front
            And a section is hidden
        When I refresh the page
        Then the section will be hidden