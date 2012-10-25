package com.gu.test;

import java.util.List;
import java.util.regex.*;

import junit.framework.Assert;
import org.openqa.selenium.*;
import cucumber.annotation.en.*;

import cucumber.runtime.PendingException;

public class AkamaiSteps {

    private final SharedDriver webDriver;

    public AkamaiSteps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }

    @Given("^I have a browser that supports content encoding$")
    public void I_have_a_browser_that_supports_content_encoding() throws Throwable {
        
        webDriver.getResponseHeaders();


        // Express the Regexp above with the code you wish you had
        throw new PendingException();
    }

    @Then("^the should be served with a supported compression format$")
    public void the_should_be_served_with_a_supported_compression_format() throws Throwable {
        // Express the Regexp above with the code you wish you had
        throw new PendingException();
    }
	
}
