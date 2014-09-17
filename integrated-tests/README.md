Integration Tests
=================

Principles
----------

Our integration tests are there to prove that our distributed stack is able to put a coherent page in front of the user.

The individual parts of our stack are independently tested and we do not repeat those tests with integration tests. For 
 example we do not need an integration test to assert that an article has a headline or that a related content component
 has an image in it.
  
We write integration tests to prove that the page has been put together properly where we rely on Ajax to enhance the 
 page. For example we might assert that for an article the related content component has been loaded.
 
We write integration tests where complex/ critical javascript interaction takes place. For example viewing the next and
 previous images in a gallery or using a drop down list to navigate to a section.
 
Setup
-----

***ALL*** The following configuration is ***optional***. If this configuration does not exist then the tests will run 
 inside the local Firefox browser against http://www.theguardian.com
 
In the file `[USER_HOME]/.gu/frontend.properties` you can configure the following...

    #integration tests - all these are optional and, where possible, have defaults
    
    # if set to remote then tests will run on saucelabs
    # uncomment to run tests against saucelabs
    #tests.mode=remote
        
    # only needed if tests.remote is set to 'remote'
    stack.userName=[YOUR_SAUCELABS_USER_NAME]
    stack.automateKey=[YOUR_SAUCELABS_AUTOMATE_KEY]
    
    # uncomment to run tests against somewhere other than production
    #tests.baseUrl=http://localhost:9000
