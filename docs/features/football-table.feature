Feature: Football Tables

As a guardian reader 
I want to see football tables on leagues and competition pages
So I can view the top four teams
And have the option to view full table and data

    Scenario: Football table on league and Domestic competition page
        Given I visit any Football league and/or Domestic competition tag page
        Then there should be a table component
         And table should show the top 4 teams
         And there should be a link to "View full table"
    
    Scenario: Football table on team pages
        Given I visit any Football team tag page
         Then there should be a table component
         And table should show the teams current position
         And there should be a link to "View full table"
