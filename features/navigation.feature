Feature: Navigation 

In order to explore the Guardian content
As a Guardian Reader
I want to access all the sections across the Guardian site

Measurements

------------

- Page views with interactions on the section links should around 4% of overall page views (based on desktop usage)
- Search results should be around 0.5% of overall page views 

    Scenario: Link to sections
		Given I visit any guardian page
		Then I am shown the top 12 sections and can link through to those section fronts 
		
	Scenario: Popular sections
		Given I visit any guardian page
		Then the 12 top sections within the navigation, are those most relevant to current events (e.g. London 2012 link should be added and lowest priority should fall from bottom)
		
	Scenario: Link to all sections
		Given I visit any guardian page,
		And want to visit a section not in the top list,
		Then I can link to a page with all the sections listed
		
	Scenario: Search
		Given I visit any guardian page,
		Then I can keyword search across all guardian articles
		

	
	
		
		



    Scenario: A link to a page 
    Scenario: Fonts should be efficiently served (Eg, localstorage, loaded async) 
    Scenario: Fonts should be securely stored & deployed (to the agreement of legal) 
    Scenario: Fonts should default to 'Georgia, serif'
    Scenario: Fonts should be served in WOFF and OTF formats