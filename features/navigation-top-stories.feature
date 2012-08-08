Feature: Navigation - Top Stories 

In order to explore the latest Guardian stories 
As a Guardian Reader
I want to work through a list of the top stories per site section

Measurements

------------

- Page views with interactions on the section links should be no less than 2.5% but the target is 5%


    Scenario: Display top stories
		Given I visit an article within a section,
		Or visit a section front,
		Then I am shown the top 10 stories for the section I am in 
		
	Scenario: Links to top stories
		Given I have visited some stories within the top stories list,
		Then I can clearly see which stories I have visited
		
