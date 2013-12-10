Feature: Footer content

In order to provide determine my legal rights and useful links about the guardian
As a Guardian reader
I want to see a set of links covering copyright, privacy, usage terms, help and contact details.

Measurements
------------
- Pages get visited over 1500 per month
- Copyright is dated as the correct year

   Scenario: View copyright
    Given I visit any page within the guardian site
    Then I should see the copyright notice at the foot of the page

	Scenario: View legal links
	Given I visit any page within the guardian site
	When I click on the legal links at the page footer
	Then I link to the relevant legal page
	
	Scenario: View help link
	Given I visit any page within the guardian site
	When I click on the sections link
	Then a link to the help page is available
	
	Scenario: View contact page
	Given I visit any page within the guardian site
	When I click on the sections link
	Then a link to the contact us available
	

  Scenario: Footer content feature is tracked with Omniture
         Given I interact with Footer content features using a mobile device, tablet or desktop
         When I track my visit using omniture
         Then Omniture will display data showing my interaction with each footer content feature
	

