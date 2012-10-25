@common

Feature: Common

    As a Guardian reader
    I want to use a website free from  technical glitches 
    So that I can experience the Guardian as intended on my web browser

	@jasmine
	Scenario: JS unit tests pass
		When I visit the common jasmine test runner
		Then all the jasmine tests pass
