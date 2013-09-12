Feature: Typography

    Scenario: Setting the typeface
        Given I visit a page
        When I set the querystring to ?gu.prefs.font-family=1
        Then the typeface should be rendered as Egyptian

    Scenario: Unsetting the typeface
        Given I visit a page
        When I set the querystring to ?gu.prefs.font-family=0
        Then the typeface should be removed from the local cache
            And the text on the page should be rendered as Georgia

    Scenario: Typeface kill-switch
        Given I have the font-family preference set
            And the typeface kill-switch is turned on
            And I visit a page
        Then the typeface should be removed from my local cache 
            And the text on the page should be rendered as Georgia

