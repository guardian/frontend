@football @ignore
Feature: Football fixtures

    In order to view recent football results and upcoming fixtures
    As a Guardian reader 
    I want to see some football stats

    Nb.
    ---

    - Notes - there's ~23 divisions and competitions 
    - The API *should* let us Replay matches - for the purpose of testing, and developing against.   
    - Caching should be 10 seconds
  
    Scenario: Users can see up to three days worth of results  
        Given I visit the "all" fixtures page
        Then I should see 3 days worth of fixtures
          
    Scenario: Users can exapnd and hide the competition filter list
        Given I visit the "all" fixtures page
        When I click the competition filter expander
        Then the competition filter list opens
        When I click the competition filter expander
        Then the competition filter list closes
        
    Scenario Outline: Fixtures pages should paginate by loading in next matches  
        Given I visit the "<pageType>" fixtures page
        When I click "Show next day's matches"
        Then I should see the following <numOfDays> days worth of fixtures
        
        Examples:
            | pageType                 | numOfDays |
            | all                      | 3         |
            # Need to use stub service, so we have consistent fixtures
            # | premierleague            | 28        |

    @scala-test @ignore
    Scenario: Fixture pages for all competitions/leagues
        Given I visit the fixtures page
        Then I should see list of all fixtures for the next three days from today for each division and competition
         And the list should be grouped by date
         And the list should be sub-grouped by competition priority 
    
    @scala-test @ignore
    Scenario: Match meta-data 
        Given I visit the fixtures page
        Then I each match should show the home team, away team and kick-off times

    @scala-test @ignore
    Scenario: Links to tag page from headings
        Given I visit the fixture page
        When I click on a division or competition heading 
        Then I should visit the corresponding competition tag page
    
    @scala-test @ignore
    Scenario: In-progress
        Given I visit the fixtures page
        When a game is in progress
        Then I should see the current score of that match
         And I should see the current match time

    @scala-test @ignore
    Scenario: In-progress links to live blogs 
        Given I visit the fixtures page
         And there's a live blog
        When a game is in progress
         And I click on the match
        Then I should visit the live blog

    @scala-test @ignore
    Scenario: Half-time, full-time, extra-time
        Given I visit the fixtures page
        When a game is at half time
        Then I should see the current state of the match is indicated as half-time
    
    @scala-test @ignore
    Scenario: Filters for each all competitions/leagues
        Given I visit the fixtures page
        When I select 'English Premier League'
        Then I should only a list of EPL fixtures  