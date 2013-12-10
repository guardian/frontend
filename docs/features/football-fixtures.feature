Feature: Football fixtures

    In order to view recent football results and upcoming fixtures
    As a Guardian reader 
    I want to see some football stats

    Nb.
    ---

    - Notes - there's ~23 divisions and competitions 
    - The API *should* let us Replay matches - for the purpose of testing, and developing against.   
    - Caching should be 10 seconds

    Scenario: Fixture pages for all competitions/leagues
        Given I visit the fixtures page
        Then I should see list of all fixtures for the next three days from today for each division and competition
         And the list should be grouped by date
         And the list should be sub-grouped by competition priority 
    
    Scenario: Match meta-data 
        Given I visit the fixtures page
        Then I each match should show the home team, away team and kick-off times

    # Nb. this is blocked by not having 'tag' pages
    Scenario: Links to tag page from headings
        Given I visit the fixture page
        When I click on a division or competition heading 
        Then I should visit the corresponding competition tag page
   
    Scenario: In-progress
        Given I visit the fixtures page
        When a game is in progress
        Then I should see the current score of that match
         And I should see the current match time

    Scenario: In-progress links to live blogs 
        Given I visit the fixtures page
         And there's a live blog
        When a game is in progress
         And I click on the match
        Then I should visit the live blog

    Scenario: Half-time, full-time, extra-time
        Given I visit the fixtures page
        When a game is at half time
        Then I should see the current state of the match is indicated as half-time
    
    Scenario: Filters for each all competitions/leagues
        Given I visit the fixtures page
        When I select 'English Premier League'
        Then I should only a list of EPL fixtures  
        
    # TODO need to add 'next' and 'previous'
    Scenario: Pagination fixtures for all competitions/leagues  
        Given I visit the fixtures page for the English Premier League
        When I click 'next 3 days'
        Then I should see the following 3 days worth of fixtures

    # TODO need to add 'next' & 'previous'
    Scenario: Pagination fixtures for a single competition/league
        Given I visit the fixtures page for the 'English Premier League'
        When I click 'next month'   
        Then I should see the following 28 days worth of fixtures
