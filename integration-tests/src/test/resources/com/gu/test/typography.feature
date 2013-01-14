@typography
Feature: Typography

    Scenario: Setting the typeface
        Given I visit a page
        Then the typeface should be rendered as "EgyptianText"

#@not-testable
   # Scenario: Typeface kill-switch
  #      Given I have the font-family preference set
   #         And the typeface kill-switch is turned on
   #         And I visit a page
   #     Then the typeface should be removed from my local cache 
   #         And the text on the page should be rendered as "Georgia""
