Feature: Articles

In order to experience all the wonderful words the Guardian write
As a Guardian reader
I want to read a version of the article optimise for my mobile devices

Measurements
------------

- Page views should *not* decrease.
- Retain people on mobile (by reducing % of mobile traffic to www and clicks to the desktop site)

    Scenario: Article body components 
        Given I visit an article
        Then I should see all the required body components  
    
    Scenario: Accessibility / SEO
        Given I visit an article
        Then it should validate against the schema.org standards

    Scenario: Images in articles
        Given I visit an article containing several images 
        Then I should see images and associated captions throughout the article

    Scenario: Link to desktop site 
        Given I visit an article
        Then I should see a link to the corresponding desktop (www) article 

    @blocked
    Scenario: Image quality
        Given I am on a low bandwidth connection
            And I visit an article containing several images
        Then it each image should be upgraded in quality
        
    @blocked
    Scenario: Different types of picture
        Given I visit an article containing a image of type 'infographic'

