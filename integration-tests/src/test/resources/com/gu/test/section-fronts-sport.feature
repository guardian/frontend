@front @section-fronts @section-fronts-sport
Feature: Section Fronts - Sport
	As a Guardian user
	I want to get a further break-down of sections on the sport section front
	So that I can navigate content easier
	
	@scala-test
	Scenario: Page contains the top 5 stories across sport
	   Given I am on the 'sport' section front
	   Then I should see the top 5 stories across sport
       
    @scala-test
    Scenario Outline: Sub-sections show a number of top stories, and be of the correct visual 'level'
        Give I am on the 'sport' section front
        Then there should be a '<sub-section>' section
            And the '<sub-section>' sub-section should contain up to <num-of-stories> stories
            And the '<sub-section>' sub-section should be a visual level <level>
        
        Examples:
            | sub-section  | num-of-stories | level |
            | Football     | 3              | 1     |
            | Cricket      | 1              | 2     |
            | Rugby Union  | 1              | 2     |
            | Motor Sport  | 1              | 2     |
            | Tennis       | 1              | 2     |
            | Golf         | 1              | 2     |
            | Horse Racing | 1              | 3     |
            | Rugby League | 1              | 3     |
            | US Sport     | 1              | 3     |
            | Boxing       | 1              | 3     |
            | Cycling      | 1              | 3     |
            
    Scenario Outline: Users can view more top stories for a section
        Given I am on the 'sport' section front
        Then the '<section>' section should have a 'Show more' cta that loads in more top stories
        
        Examples:
            | section  |
            | Sport    |
            | Football |
         
    Scenario: Users can hide sections
        Given I am on the 'sport' section front 
        When I hide a section
        Then the section will be hidden

    @brokeninchrome
    Scenario: Users can show hidden sections
        Given I am on the 'sport' section front
            And a section is hidden 
        When I show a section
        Then the section will be shown
            