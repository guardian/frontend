Feature: Video embedded in article

In order to access all content on a given story
As a Guardian reader 
I want to see videos that are embedded in an article page

    Scenario: Displaying guardian video in articles
        Given a Guardian video is embedded in an article
        Then the video should be displayed and played in the format suitable to the device I'm currently on
     
    Scenario: Displaying video from another source
	Given a Guardian video is embedded in an article from another source
Then the video should be displayed and played in the best format provided
    


 

