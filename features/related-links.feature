Feature: Related Links

In order to continue reading more about the story 
As a Guardian reader
I want to visit related links to the current article I am reading

Measurements
------------
 
- Increase average number of articles 'read' from 1.9% to 2.5%

    Scenario: Visit related links
        Given I visit an article containing related links
        When I select a related link headline
        Then I should visit the corresponding article
