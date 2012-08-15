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
	When I click on the legal links
	Then I link to the relevant legal page
	
	Scenario: View help link
	Given I visit any page within the guardian site
	When I click on the help link
	Then I link to the help page
	
	Scenario: View contact page
	Given I visit any page within the guardian site
	When I click on the contact us link
	Then I link to the contact page
	
	

