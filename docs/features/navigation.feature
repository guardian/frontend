Feature: Navigation - Sections

In order to explore the Guardian content
As a Guardian Reader
I want to access all the sections across the Guardian site

Measurements

------------

- Page views with interactions on the section links should around 4% of overall page views (based on desktop usage)
- Search results should be around 0.5% of overall page views 

    Scenario: Link to sections
		Given I visit any guardian page
                When I click the sections link
		Then I am shown the top 12 sections 
                and I can link through to those sections to view their fronts 
		
   Scenario: Popular sections
		Given I visit any guardian page
                When I view the 12 sections displayed
		Then the 12 top sections within the navigation, are those most relevant to current events (e.g. London 2012 link should be added and lowest priority should fall from bottom)
		
   Scenario: Link to 'All sections'
		Given I visit any guardian page
		When I want to visit a section not in the listed top 12 sections
		Then I can click the 'All sections' link
                And be shown a list of 'All sections'
                And I can access my desired section fronts from the full list 

   Scenario: Sections menu should slide down to open
	        Given I visit any guardian page
                When I click on the sections link to open it
                Then the section menu should slides down
  
   Scenario: Sections menu should slide up to close
                Given I visit any guardian page
                When I click on the sections to close it
                Then the sections menu should slide up

   Scenario: Editions
               Given I visit any guardian page
               When I click the sections link
               Then I can switch between the UK and US editions

 
   Scenario: Section navigation is tracked with Omniture
         Given I interact with Section features using a mobile device, tablet or desktop
         When I track my visit using omniture
         Then Omniture will display data showing my interaction with each section tab