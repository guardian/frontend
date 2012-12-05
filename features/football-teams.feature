Feature: Football Team tag pages

As a Guardian news reader
I want to view a Team's page
So that I can see a teams upcoming fixtures, previous result and position within a league table

    Scenario: Fixtures on team tag page
        Given I visit any Football team tag page
        Then there is a team "fixtures" component 
         And the team's 2 upcoming fixtures are shown
         And there should be a link to "View all fixtures"

    Scenario: Results on team tag page
        Given I visit any Football team tag page
        Then there is a team "results" component
         And the previous result is shown
         And there should be a link to "View all results"

    Scenario: 5 row Football table on team tag page
        Given I visit any Football team tag page
        Then there should be a table component
         And table will show the teams current position within 5 rows
         And the teams row should be highlighted
         And there should be a link to "View full table"