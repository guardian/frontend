@front  @network-front
Feature: Network front

    Scenario Outline: Users can view more top stories for a section
        Given I visit the network front
        Then the '<section>' section should have a 'Show more' cta that loads in more top stories
        
        Examples:
            | section         |
            | Sport           |
            | Comment is free |
            | Culture         |
         
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