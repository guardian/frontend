Feature: Football nav

    In order to navigate between football pages

    As a Guardian reader I want to navigate to football stats
    So I can view statistics for all competitions and specific competitions

    Scenario: 
        Given I visit the football front
        Then I should see the navigation module
        And will consist of links to live scores, fixtures, results, tables and competitions
    
    Scenario:
        Given I haven't filtered by competition
        Then each page should display links to stats for all competitions

    Scenario: 
        Given I have filtered by competition
        Then each page should display links to stats for filtered competitions