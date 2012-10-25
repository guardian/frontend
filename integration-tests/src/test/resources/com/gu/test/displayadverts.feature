@ignore
@displayadvertstest

Feature: Display Adverts
	As a guardian reader 
	I want to see adverts on all pages I visit on the guardian site
	So I can interact with the adverts and link to the advertised brand site

  	Background:
    	Given I am on the article page 
    	
    Scenario: Adverts will appear at top of all pages
        Given I visit a page
        Then an advert will be at the top of the page
   
   	Scenario: Adverts will appear at the foot of all pages
        Given I visit a page
        Then an advert will be at the foot of the page

	#Scenario: Click Adverts to navigate to brand site
    #     Given I'm on a guardian page with adverts 
    #     When I click an advert
    #     Then the brands site is displayed on a new window


