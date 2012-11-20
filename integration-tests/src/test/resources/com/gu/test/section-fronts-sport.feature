@front @section-fronts @sport-front
Feature: Section Fronts - Sport
	As a Guardian user
	I want to get a further break-down of sections on the sport section front
	So that I can navigate content easier
	
	@scala-test
	Scenario: Page contains the top 10 stories across sport
	   Given I am on the 'sport' section front
	   Then I should see the top 10 stories across sport

    Scenario: Sport top stories should display 5 and hide the rest
        Given I am on the 'sport' section front
        Then I should see up to 5 'Sport' top stories
            And any more than 5 'Sport' top stories should be hidden
       
    @scala-test
    Scenario Outline: Sub-sections show a number of top stories, and be of the correct visual 'level'
        Give I am on the 'sport' section front
        Then there should be a '<sub-section>' section
            And the '<sub-section>' sub-section should contain up to <num-of-stories> stories
            And the '<sub-section>' sub-section should be a visual level <level>
        
        Examples:
            | sub-section  | num-of-stories | level |
            | Football     | 6              | 1     |
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

    Scenario: Football top stories should display 3 and hide the rest
        Given I am on the 'sport' section front
        Then I should see up to 3 'Football' top stories
            And any more than 3 'Football' top stories should be hidden

    Scenario: User can hide and show the sections
        Given I am on the 'sport' section front
        Then I can click "Hide" to collapse a section
            And I can click "Show" to expand a section
            