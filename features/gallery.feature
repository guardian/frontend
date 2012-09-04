Feature: Galleries in articles

In order to view the Guardian's beautiful photography
As a Guardian reader
I want to explore the imagery associated with a news article

Measurements
------------
 
- Increase gallery page views from 1.6% (when on different page on desktop) to 3% of page views with gallery interactions when integrated in same page.

   Scenario: Display associated gallery images
    Given I visit an article with an associated image gallery 
    Then I should have access to all the images without leaving the article page

	Scenario: Display images full screen
	Given I see interesting images on an article
	Then I should link to a full screen version when I click on them
	
	Scenario: Click on next-prev / Swipe to scroll through all images in page
	Scenario: Captions per image should be displayed 
	Scenario: Click on image to go into full page view
	Scenario: Full screen should allow to swipe & click for next/prev and have a close button
	Scenario: Landscape & portrait views in full screen should be implemented
	Scenario: User can choose to display captions or not
	Scenario: From full screen view, back button should return you to the article
	


      Scenario: Image gallery feature is tracked with Omniture
         Given I interact with Image Gallery features using a mobile device, tablet or desktop
         When I track my visit using omniture
         Then Omniture will display data showing my interaction with Image Gallery features
	

