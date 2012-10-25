@article

Feature: Articles

    As a Guardian reader
    I want to read the articles the Guardian writes
    So that I learn about what's going on in the world 
	
  	Background:
    	Given I am on the article page 

	Scenario: Read more articles on the story I am reading
		When the article has a story package
		Then "More on this story" is displayed 
 
	Scenario: Read related articles to the one I am reading
		When the article has no story package
		Then "Related content" is displayed
	
    Scenario: Read most read stories from across the Guardian
		When I select pan-site "Most read"
		Then I can see a list of the most popular stories on guardian.co.uk for the whole guardian site

	Scenario: Read the most read stories for the section I'm currently in
        When I visit a "sport" article
		Then the "most read" section tab should be labelled "sport"
    
	Scenario: Find a list of top stories from anywhere in the site (top) 
		When I click "Top stories" tab at the top of the page
		Then a list of "Top stories" opens
		And another click on "Top stories" closes the list.

	Scenario: Find a list of top stories from anywhere in the site (bottom) 
		When I click "Top stories" tab at the foot of the page
		Then a list of the footer "Top stories" opens
		And another click on the footer "Top stories" closes the list.
		
    Scenario: Find a list of section fronts (top) 
		When I select the sections navigation button
		Then it should show me a list of sections

	Scenario: Viewing a high-resolution photo
		And the article has an article image
		And I have a fast connection speed
		Then the high resolution version of the image is displayed

	Scenario: Expand and collapse expanders on more on this story
		And "More on this story" has expanders
        Then I can expand and collapse expanders

