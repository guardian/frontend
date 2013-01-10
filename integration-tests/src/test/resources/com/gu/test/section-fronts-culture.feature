@front @section-fronts @section-fronts-culture
Feature: Section Fronts - Culture
    As a Guardian user
    I want to get a further break-down of sections on the culture section front
    So that I can navigate content easier
    
    @scala-test
    Scenario: Page contains the top 5 stories across culture
       Given I am on the 'culture' section front
       Then I should see the top 5 stories across culture
       
    @scala-test
    Scenario Outline: Sub-sections show a number of top stories, and be of the correct visual 'level'
        Given I am on the 'culture' section front
        Then there should be a '<sub-section>' section
            And the '<sub-section>' sub-section should contain up to <num-of-stories> stories
            And the '<sub-section>' sub-section should be a visual level <level>
        
        Examples:
            | sub-section  | num-of-stories | level |
            | TV & Radio   | 1              | 2     |
            | Film         | 1              | 2     |
            | Music        | 1              | 2     |
            | Stage        | 1              | 2     |
            | Books        | 1              | 3     |
            | Art & Design | 1              | 3     |
            | Games        | 1              | 3     |
            
    Scenario: Users can view more top stories for a section
        Given I am on the 'culture' section front
        Then the 'Culture' section should have a 'Show more' cta that loads in more top stories
         
    Scenario: Users can hide sections
        Given I am on the 'culture' section front 
        When I hide a section
        Then the section will be hidden
    
    Scenario: Users can show hidden sections
        Given I am on the 'culture' section front
            And a section is hidden 
        When I show a section
        Then the section will be shown
            