Feature: Football Team tag pages

As a Guardian news reader
I want to view a Team's page
So that I can see a teams upcoming fixtures, previous result and position within a league table





   Scenario: Fixtures and results on team page

        Given I'm on a football team page
        Then there is a team fixtures component 
        And the team's 2 upcoming fixtures are shown
        And there is a link to 'view fixtures'

        
        Given I'm on a football team page
        Then there is a team results component
        And the previous result is shown
        And there is a link to 'view results'

   Scenario: Football table on team pages
        Given I visit any Football team tag page
        Then there is a table component
        And table will show the teams current position within 5 rows
        And there should be a link to "View full table"


       

  