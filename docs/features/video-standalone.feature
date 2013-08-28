Feature: Video Standalone Page

In order to view multimedia Guardian content
As a Guardian reader 
I would to like see video-specific content pages



    Scenario: Displaying videos on video pages
        Given I visit a video page
        Then the video is displayed in the format suitable for my device

 Scenario: Displaying video details
        Given I visit a video page
        Then I should see the video standfirst
And the video headline
And the video length
And the video producers
And the video source (if not Guardian.co.uk)


Scenario: Displaying video series
Given I visit a video page
When it is part of a series
Then I should see a list of videos from the same series
And not see any related videos


Scenario: Displaying related videos
Given I visit a video page
When it is not part of a series
Then I should see a list of related videos
    
    Scenario: Displaying most popular videos
        Given I visit a video page
        Then I should see a list of the most popular videos across the guardian site
    
   Scenario: Displaying most popular videos in section
        Given I visit a video page
        Then I should see a list of the most popular videos within that section

 

