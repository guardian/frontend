Feature: Video as Lead Article Image

In order to access all content on a given story
As a Guardian reader 
I want to see video images and content on articles and fronts
So I can see what the story is about before clicking through
And view an image and video on the article page


    Scenario: Displaying video Image on fronts
        Given I visit the network or section front
        When a story has a video as lead rather than an image
        Then I display the video poster image or story thumbnail

// e.g. http://explorer.content.guardianapis.com/#/world/2012/nov/07/obama-four-more-years-america-verdict?format=json&show-fields=all&show-media=all&order-by=newest&api-key=techdev-internal
     
    Scenario: Displaying image within article
        Given I visit an article with a video as the lead image
        Then I should see an image about the story where the lead image is normally placed
    
    Scenario: Displaying video within article
        Given I visit an article with a video as the lead image
        Then I should see a video where the lead image is normally placed

 

