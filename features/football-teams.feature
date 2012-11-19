Feature: Football Teams

As a Guardian news reader
I want to view Team pages
So that I can see a teams next fixtures and previous result.





   Scenario: Fixtures and results on team page

        Given I'm on a football team page
        Then there is a team fixtures component 
        And the next fixtures are shown(confirm number to display)
        And there should be a link to 'view fixtures'

        
        Given I'm on a football team page
        Then there is a team results component
        And the previous result is shown
        And there should be a link to 'view results'

  