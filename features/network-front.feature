Feature: Network front

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

	# to be discussed with content api
	Scenario: Story importance 

Feature: Network front tool

	Scenario: Produce a 'special event' block
	Scenario: Save the state 
	Scenario: Set a title
	Scenario: Set a state
	
		# Select a tag, select a title, save the state, preview?
