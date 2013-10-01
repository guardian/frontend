@frontendadmintest

Feature: Network-front tool
	As an editor
	I want to be able to insert special events on to the front-page
	So that I can promote high-profile content that's not immediately visible in the
	default front-page trailblock.

  	Background:
    	Given I visit a page

  	Scenario: Authentication
    	When I am not logged in
    	Then I should be prompted to log in

	Scenario: Logout
		Given I am logged in
		When I click the logged out button
		Then I should be logged out

	Scenario: No events configured
		Given I am logged in
		And I am on the editor page
		And are no configured special events
		When I am on the editor page
		Then I should see an empty form

	Scenario: Creating an event with a tag
		Given I am logged in
        And I am on the editor page
		And are no configured special events
		When I enter a tag id 'sport/triathlon'
		And click 'save'
		Then the configuration should be saved

	Scenario: Tag validation
		Given I am logged in
        And I am on the editor page
		When I enter an non-existant tag
		And click 'save'
		Then then configuraiton should not be saved

	#Scenario: Errors saving
	#	Given I am logged in
    #   And I am on the editor page
	#	When I enter a tag id 'sport/triathlon'
	#	And click 'save'
	#	And the was an error saving
	#	Then the user should be told the configuration has not been saved

	Scenario: Clearing the event
		Given I am logged in
        And I am on the editor page
		And there is an existing event called 'sport/triathlon'
		When I click 'clear'
		And click 'save'
		Then the event should be removed
