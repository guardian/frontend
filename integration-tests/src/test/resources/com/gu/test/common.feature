@common
Feature: Common
	As a Guardian developer
	I want to have faith that the common code is stable
	
	@jasmine
	Scenario: JS unit tests pass
		When I visit the common jasmine test runner
		Then all the jasmine tests pass