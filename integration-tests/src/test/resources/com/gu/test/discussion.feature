Feature:
As a Guardian reader
I want to read comments
So I can engage with other users

Scenario:
Given I am on an article with comments
When I choose to view the comments
Then I can see 10 top level comments
And the first comment is authored by "monkeyface"
And the first comment body contains "Well done Guardian!"
When I show more comments
Then I can see 20 top level comments
