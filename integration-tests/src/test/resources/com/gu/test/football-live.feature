@football @football-live
Feature: Football live matches page

    In order to keep up-to-date with live games
    As a Guardian reader 
    I want to see real time updates of matches

    Scenario: The live match page has auto-update functionality
        Given I visit the live match page
        Then there should be an auto-update component
            
    #Scenario: Auto-update is on by default
    #    Given I visit the live match page
    #    Then auto-update should be on
           
    #Scenario: Auto-update updates the matches every 10 secods 
    #    Given I visit the live match page
    #    Then the matches should update every 10 seconds

    #Scenario: Users can turn auto-update on and off
    #    Given I visit the live match page
    #    When I click the auto-update off button
    #    Then auto-update should be off
           
    #Scenario: Auto-update setting persists through user's journey
    #    Given I visit the live match page
    #        And I click the auto-update off button
    #    When I refresh the page
    #    Then auto-update should be off