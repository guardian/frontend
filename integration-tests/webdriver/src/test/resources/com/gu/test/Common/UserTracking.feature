@httpMock
@common
Feature: As a Guardian Product owner I want to track user actions

  Scenario: tracking sent on article load
    Given Pete is viewing the front page
    When he moves on to the first article
    Then the correct tracking information should be sent out

  Scenario: tracking sent on show more

  Scenario: tracking when gallery is opened on the front page