@football
Feature: Football fixtures

    In order to view recent football results and upcoming fixtures
    As a Guardian reader 
    I want to see some football stats

    Nb.
    ---

    - Notes - there's ~23 divisions and competitions 
    - The API *should* let us Replay matches - for the purpose of testing, and developing against.   
    - Caching should be 10 seconds
    - Need to get this working with football stub api, so we have consistent data

    Scenario Outline: Users can expand and hide the competition filter list
        Given I visit the "<competition>" <pageType> page for <date>
        When I click the competition filter expander
        Then the competition filter list opens
        When I click the competition filter expander
        Then the competition filter list closes
        
        Examples:
            | pageType | competition   | date       |
            | fixtures | all           | today      |
            | fixtures | premierleague | today      |
            | fixtures | all           | 25/10/2012 |
            | fixtures | premierleague | 25/10/2012 |
            | results  | all           | today      |
            | results  | premierleague | today      |
            | results  | all           | 25/10/2012 |
            | results  | premierleague | 25/10/2012 |
        
    Scenario Outline: Pages should paginate by loading in matches  
        Given I visit the "<competition>" <pageType> page for <date>
        When I click "<buttonText>"
        Then <numOfDays> days worth of <pageType> should load in
        
        Examples:
            | pageType | competition   | numOfDays | date       | buttonText                  |
            | fixtures | all           | 3         | today      | Show next day's matches     |
            # need to use the stub service
            #| fixtures | premierleague | 20        | today      | Show next day's matches     |
            | results  | all           | 3         | today      | Show previous day's matches |
            # | results  | premierleague | 20        | today      | Show previous day's matches |
    
    @scala-test
    Scenario: Users can see up to three days worth of fixtures  
        Given I visit the "all" fixtures page
        Then I should see 3 days worth of fixtures

    @scala-test
    Scenario: Fixture pages for all competitions/leagues
        Given I visit the fixtures page
        Then I should see list of all fixtures for the next three days from today for each division and competition
         And the list should be grouped by date
         And the list should be sub-grouped by competition priority 
    
    @scala-test
    Scenario: Match meta-data 
        Given I visit the fixtures page
        Then I each match should show the home team, away team and kick-off times

    @scala-test
    Scenario: Links to tag page from headings
        Given I visit the fixture page
        When I click on a division or competition heading 
        Then I should visit the corresponding competition tag page
    
    @scala-test
    Scenario: In-progress
        Given I visit the fixtures page
        When a game is in progress
        Then I should see the current score of that match
         And I should see the current match time

    @scala-test
    Scenario: In-progress links to live blogs 
        Given I visit the fixtures page
         And there's a live blog
        When a game is in progress
         And I click on the match
        Then I should visit the live blog

    @scala-test
    Scenario: Half-time, full-time, extra-time
        Given I visit the fixtures page
        When a game is at half time
        Then I should see the current state of the match is indicated as half-time
    
    @scala-test
    Scenario: Filters for each all competitions/leagues
        Given I visit the fixtures page
        When I select "English Premier League"
        Then I should only a list of EPL fixtures
        
    @scala-test
    Scenario: User can see up to 3 days worth of results  
        Given I visit the "all" results page
        Then I should see 3 days of results
        
    @scala-test
    Scenario: User can see up to 28 days worth of results for a particular competition  
        Given I visit the "premierleague" results page
        Then I should see 28 days of results
        
    @scala-test
    Scenario Outline: The 'Desktop version' link points to the correct, equivalent desktop page
        Given I visit the '<page>' page
            And I am on the '<edition>' edition
        Then the 'Desktop version' link should point to '<url>'
        
        Examples:
            | page     | edition | url                                                                |
            | table    | UK      | http://www.guardian.co.uk/football/matches?mobile-redirect=false   |
            | table    | US      | http://www.guardiannews.com/football/matches?mobile-redirect=false |
            | live     | UK      | http://www.guardian.co.uk/football/matches?mobile-redirect=false   |
            | live     | US      | http://www.guardiannews.com/football/matches?mobile-redirect=false |
            | fixtures | UK      | http://www.guardian.co.uk/football/matches?mobile-redirect=false   |
            | fixtures | US      | http://www.guardiannews.com/football/matches?mobile-redirect=false |
            | results  | UK      | http://www.guardian.co.uk/football/matches?mobile-redirect=false   |
            | results  | US      | http://www.guardiannews.com/football/matches?mobile-redirect=false |
            
    @scala-test
    Scenario Outline: Matches are ordered by start time, then alphabet
        Given I am on the 'results' page
        Then the '<competition>' matches on '<date>' should be ordered as '<order>'
        
        Examples:
            | competition           | date  | order                                            |
            | Scottish Division Two | today | Albion, Aloa, Brechin, East Fife, Queen of South |
    
        