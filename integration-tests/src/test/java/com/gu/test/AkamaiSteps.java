package com.gu.test;

import java.net.URL;
import java.net.URLConnection;

import junit.framework.Assert;
import cucumber.annotation.en.*;



public class AkamaiSteps {

    private final SharedDriver webDriver;

    public AkamaiSteps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }

    @Given("^I have a browser that supports content encoding$")
    public void I_have_a_browser_that_supports_content_encoding() throws Throwable {

    }
    
    @Then("^pages should be served with a supported compression format$")
    public void pages_should_be_served_with_a_supported_compression_format() throws Throwable {
    	System.out.println( webDriver.getproxyUrl());
    	URLConnection response = webDriver.getRawHttp("http://"+webDriver.getproxyUrl());
    	Assert.assertTrue(response.getHeaderField("Content-Encoding").equals("gzip"));
    	Assert.assertTrue(response.getHeaderField("Vary").contains("Accept-Encoding"));
    }

}
