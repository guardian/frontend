@common
Feature: As Vicky I want to change which edition I am in

  Scenario: changing from UK to US from fronts
    Given Vicky is viewing the front page
    When she switches to the US edition
    Then the US edition fronts should load

  Scenario: changing from UK to AU from fronts
    Given Vicky is viewing the front page
    When she switches to the AU edition
    Then the AU edition fronts should load

  Scenario: changing from UK to US from an article
    Given Vicky is viewing an article
    When she switches to the US edition
    Then the US edition fronts should load


  Scenario: changing from US to UK from US fronts
    Given Vicky is viewing the front page
    When she switches to the US edition
    And she switches back to the UK edition
    Then the UK edition fronts should load