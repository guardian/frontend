Feature: Navigation - Top Stories 

In order to explore the latest Guardian stories 
As a Guardian Reader
I want to work through a list of the top stories per site section

Measurements

------------

- Page views with interactions on the section links should be no less than 2.5% but the target is 5%

    Scenario: Top stories link hidden on the network front
                Given I visit the guardian network front
                When I view the top of the page
                Then the Top stories link is hidden

    Scenario: Display top stories
		Given I visit an article within a section, Or visit a section front
                When I view the top of the article or front
                Then the Top stories link is shown
		
    Scenario: Show 10 Top stories from the guardian site       
                Given I visit an article within a section, Or visit a section front
                When I click the Top stories link
                Then I'm shown the top 10 stories from the guadian site
		
    Scenario: Links to top stories (visited state)
		Given I can see the Top 10 stories list
                When I have visited some stories within the top stories list
                Then the stories I have visited will have a visted state

    Scenario: Top stories menu should slide down to open
               Given I visit an article within a section, Or visit a section front and the Top stories menu is closed
               When I click on the Top stories link to open it
               Then the Top stories menu should slide down

    Scenario: Top stories menu should slide up to close
               Given I visit an article within a section, Or visit a section front and the Top stories menu is open
               When I click on the Top stories link to close it
               Then the Top stories menu should slide up  

    Scenario: Link to  Top story
               Given I have the Top stories menu open
               When I click on a Top story link
               Then I'm taken to the clicked article/story
		

 Scenario: Top Stories navigation is tracked with Omniture
           Given I interact with Top stories feature using a mobile device, tablet or desktop
           When I track my visit using omniture
           Then Omniture will display data showing my interaction with Top Stories feature
