@routing

Feature: Routing

    Scenario: Correct trailing slashes
        Given I visit an article with a trailing slash
        Then I should be automatically redirected to the correct page

