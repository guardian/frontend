Feature: Football fixtures

    In order to view recent football results and upcoming fixtures
    As a Guardian reader 
    I want to see some football stats

    Nb.
    ---

    - Notes - there's ~23 divisions and competitions 
    - The API *should* let us Replay matches - for the purpose of testing, and developing against.   
    - Caching should 10 seconds

    Scenario: Fixture pages for the next three days
        Given I visit the fixture page
        Then I should see list of all fixtures for the next three days for each division and competition
        And the list should be grouped by competition priority 

    Scenario: Links to tag page from headings
        Given I visit the fixture page
        When I click on a division or competition heading 
        Then I should visit the corresponding competition tag page
   
    Scenario: In-progress scores (page refresh version)
        Given I visit the fixture page
        When a game is in progress
        Then I should see the current score of that match
    
    Scenario: In-progress links to live blogs 
        Given I visit the fixture page
        And there's a live blog
        When a game is in progress
        And I click on the match
        Then I should visit the live blog

    Scenario: Half-time, full-time, extra-time
        Given I visit the fixture page
        When a game is at half time
        Then I should see the current state of the match is indicated as half-time
    
    Scenario: Filters for each competition
        Given I visit the fixtures page
        When I select 'English Premier League'
        Then I should only a list of EPL fixtures  
   
    Scenario: Pagination fixtures (inside the current season)
        Given I visit the fixtures page
        When I click 'next 3 days'   
        Then I should see the following 3 days worth of fixtures

    Scenario: Link to match reports & statisticsi
        Given I visit the fixture page
        When a game is in progress or finsihed
        And when I click on that match
        Then I should visit the match report and statistics page


