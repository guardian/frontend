Feature: Football Tables

As a guardian reader 
I want to see football tables on leagues and competition pages
So I can view the top for teams
And have the option to view full table and data





   Scenario: Football table on league and Domestic competition page

        Given I visit any Football league and/or Domestic competition tag page
        Then football table will show the top four for teams
        And a click to view full table and data will display the complete Football league table
        


   Scenario: Football table on team pages

        Given I visit any Football team tag page
        Then Football table will show team within four rows in current position
        And a click to view full table and data will display the complete Football league table


