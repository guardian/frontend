Feature: Network front

	As a user I want to be presented with a
	I want to ... 
	So that ...

	- Metric: 
	- Metric: 

 

    Scenario: Trailblocks
		Given I visit the front page
		Then I should see the following trailblocks <News(Top stories), Sport, Comment is free, Features, 
                Culture, Business, Life style, Money and Travel>
                And each block have minimum 1 story maximum 5 stories
                And expanders for each block be maximum 5 stories

	Scenario: Texture
		Given a series of trailblocks network front 
	 	Then each block should obey the visual design rules 	

	Scenrio: Comments
		Given there a Comment Is Free block on the network front
		Then it's visually differentiated from other sections 

	Scenario: Represent 'special event' block on the network front 
		Given a there is a special event called 'Paralypmpics'
			And it's corresponds to a tag called 'paralympics'
		Then I should see the first four paralympics stories on the network front
			appear after the top stories block
		And it should be visually represented by it's parent tag section

	Scenario: Deduplication of stories
		Given the same story appears in two or more visible trailblocks 
		Then only the first occurance should be retained

	# to be discussed with content api
	Scenario: Story importance 

Feature: Network front tool

	Scenario: Produce a 'special event' block
	Scenario: Save the state 
	Scenario: Set a title
	Scenario: Set a state
	
		# Select a tag, select a title, save the state, preview?
		
	
	######################## additional tests ###########################	
Scenario: guardian logo and icon are displayed
		Then guardian icon is displayed
		And guardian logo is displayed
		
			
 Scenario: Sections tab is shown amd top stories are hidden
		Then "Top stories" tab is hidden
		And "Sections" tab is shown	

	Scenario: show and hide to expand and collapse each section 
		When I "Hide" to collapse each section on the network front
		Then I can "Show" to expand each section on the network front

	Scenario: collapsed section will remain collapsed on moving away from page
		Given I "Hide" to collapse a section on the network front
		When I navigate to an article page and back to the network front
		Then the collapsed section will stay collapsed

	Scenario: collapsed section will remain collapsed on refresh
		Given I "Hide" to collapse a section on the network front
		When I refresh the network front
		Then the collapsed section will stay collapsed

	Scenario: collapsed section will remain collapsed on moving to navigate to a section front
		Given I "Hide" to collapse a section on the network front
		When I navigate to a section front
		Then the collapsed section will stay collapsed



