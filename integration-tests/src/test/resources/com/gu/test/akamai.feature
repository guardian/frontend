@akamai

Feature: Akamai (CDN)

    As a Guardian reader
    I want the site to feel responsive whatever my geographic location or device
    So that I can have a faster reading experience

    @cdn
    Scenario: View compressed web pages
        Given I have a browser that supports content encoding
        Then the site should be served with a supported compression format

