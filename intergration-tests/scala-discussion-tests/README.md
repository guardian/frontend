Issues and Assumptions:

1.  Test Registered user must have 'Staff Member" privileges in order to complete the automated tests. This is so we get around the limitation of only being able to add 1 comment per minute.

2.  Staff Members cannot 'Pick a comment' their own comment.

3.  Add a .gitignore file to project root.

4.  Add a local.conf file to the project root and paste the following, making changes where necessary:

        "browser": "firefox" - Replace with the browser of your choice to be used chrome, firefox or ie
        "idApiRoot" : "https://idapi.code.dev-theguardian.com" - Replace with the Identity API root
        
        "testBaseUrl": "http://m.code.dev-theguardian.com/" - Replace with your testBaseURL here ]
        
        "loginEmail" : "testuser@test.com" - Replace with your test loginEmail here
        "loginPassword" : "PASSWORD" - Replace with your test password here
        
        user: {
          "testArticlePath": "/science/grrlscientist/2012/aug/07/3" - Replace with your test article here
          
How to run individual tests:
Use this TAG to run individual tests - select:
    scenarioWeb("navigate through comment pages", Tag("WIP")) { ...

When running the test, in the menu "Run > Edit config " add the following to the Test Options: -n <TagName>  Then run the tests.