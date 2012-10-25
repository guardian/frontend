@football
Feature: Football results

    In order to view recent football results and upcoming fixtures
    As a Guardian reader 
    I want to see some football stats

    Nb.
    ---

    - Notes - there's ~23 divisions and competitions 
    - The API *should* let us Replay matches - for the purpose of testing, and developing against.   
    - Caching should be 10 seconds

    Scenario: Results for a competitions/leagues  
        Given I visit the results page for 08/10/2012
        Then I should see 3 days worth of results

    Scenario: Pagination results for all competitions/leagues  
        Given I visit the results page for 08/10/2012
        When I click 'Show more matches'
        Then I should see the following 3 days worth of results
    
    @ignore    
    Scenario: Results for a single competition/league
        Given I visit the 'premierleague' results page for 07/10/2012 
        Then I should see 20 days worth of results

    @ignore
    Scenario: Pagination results for a single competition/league
        Given I visit the 'premierleague' results page for 07/10/2012 
        When I click 'next month'   
        Then I should see the following 20 days worth of results

    @To do
    Scenario: Select competition to filter results
        Given I visit all results page
        When I click 'All results' filter
        Then I can open and close result filter to all leagues and competions
