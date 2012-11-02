@articletest @article
Feature: Article page
	As a guardian mobile user
	I want to check available content is displayed on the article page
	So that I am able to browse all the article content correctly
	
	# need a story that has more on this story (consistently)
    @ignore
	Scenario: More on this story
		Given I am on an article with a story package
		Then "More on this story" is displayed 

	Scenario: Article has no story package
	    Given I am on an article without a story package
        Then "Related content" is displayed
	
	Scenario: Most read
		When I open a "sport" article
		Then "most read" section tab show read "sport"

	Scenario: Most read (per section)
		Given I am on an article
		When I select the sectional "Most read"
		Then I can see a list of the most popular stories on guardian.co.uk for the section I am in
    
	Scenario: Most read (pan-site)
        Given I am on an article
		When I select the pan-site "Most read"
		Then I can see a list of the most popular stories on guardian.co.uk for the whole guardian site

	Scenario: Open and close top story from top of page
	    Given I am on an article 
		When I click "Top stories" tab at the top of the page
		Then a list of "Top stories" opens
            And another click on "Top stories" closes the list.

	Scenario: Open and close top story from foot of page
        Given I am on an article
		When I click "Top stories" tab at the foot of the page
		Then a list of the footer "Top stories" opens
		    And another click on the footer "Top stories" closes the list.
		
	Scenario: Open and close sections from top of page
	    Given I am on an article
		When I select the sections navigation button
		Then it should show me a list of sections

	Scenario: High resolution image and caption is displayed
        Given I am on an article with an image
    		And I have a fast connection speed
		Then the high resolution version of the image is displayed

	Scenario: Expand and collapse expanders on more on this story
        Given I am on an article with expanders for "More on this story"
		Then I can expand and collapse expanders

 	Scenario: Expand and collapse expanders on related content
        Given I am on an article with expanders for "Related content"
		Then I can expand and collapse expanders
		
    Scenario: Back to top
        Given I am on an article
    	When Back to top is selected
        Then article page scrolls to the top

    Scenario: Page footer links
        Given I am on an article     
    	When I click footer links (Desktop version, Help, Contact us, Feedback, T&C's and Pricacy policy)
    	Then the corresponding footer pages are displayed

	# needs a page where content is not displayed
	@ignore
	Scenario: Related content is unavailable
	    Given I am on an article with a story package
		Then "related content" is not displayed
