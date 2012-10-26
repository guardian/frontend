@section-fronts
Feature: Section Fronts - Culture
    As a Guardian user
    I want to get a further break-down of sections on the culture section front
    So that I can navigate content easier
    
    @scala-test
    Scenario: Page contains the top 10 stories across culture
       Given I am on the 'culture' section front
       Then I the page should contains the top 10 stories across culture
       
    Scenario: Culture top stories should display 5 and hide the rest
        Given I am on the 'culture' section front
        Then up to 5 top stories should be displayed
            And more than 5 top stories should be hidden
       
    @scala-test
    Scenario Outline: Sub-sections show a number of top stories, and be of the correct visual 'level'
        Give I am on the 'culture' section front
        Then there should be a '<sub-section>' section
            And the '<sub-section>' should contain up to <num-of-stories> stories
            And the '<sub-section>' should be a visual level <level>
        
        Examples:
            | sub-section  | num-of-stories | level |
            | TV & Radio   | 1              | 2     |
            | Film         | 1              | 2     |
            | Music        | 1              | 2     |
            | Stage        | 1              | 2     |
            | Books        | 1              | 3     |
            | Art & Design | 1              | 3     |
            | Games        | 1              | 3     |
       
    Scenario: User can hide and show the sections
        Given I am on the 'culture' section front
        When I click the 'hide' section button
        Then the section should collapse
        When I click the 'show' section button
        Then the section should expand
            