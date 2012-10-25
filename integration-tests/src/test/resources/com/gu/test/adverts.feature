@ignore

@adverts

Feature: Adverts
    
    As a Guardian reader 
	I want to ensure the financial well-being of the organisation 
    So that I can continue to access it's journalism (for free)

  	Background:
    	Given I am on the article page 
    	
    Scenario: See an advert at the top of the page # TODO what is the correct word for this?
        Given I visit any page on the Guardian site
        Then an advert will be at the top of the page
   
    Scenario: See an advert at the bottom of the page # TODO what is the correct word for this?
        Given I visit any page on the Guardian site
        Then an advert will be at the foot of the page

