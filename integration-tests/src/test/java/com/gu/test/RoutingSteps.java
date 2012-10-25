package com.gu.test;

import java.util.List;
import java.util.regex.*;

import junit.framework.Assert;
import org.openqa.selenium.*;
import cucumber.annotation.en.*;

import cucumber.runtime.PendingException;

public class RoutingSteps {

    private final SharedDriver webDriver;

    public RoutingSteps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }

    @Given("^I visit an article with a trailing slash$")
    public void I_visit_an_article_with_a_trailing_slash() throws Throwable {
        webDriver.open("/sport/2012/oct/10/icc-suspends-umpires-corruption-claims/");
    }

    @Then("^I should be automatically redirected to the correct page$")
    public void I_should_be_automatically_redirected_to_the_correct_page() throws Throwable {
        Assert.assertEquals(webDriver.getTitle(), "ICC suspends six umpires pending investigation into corruption claims");    
    }

}
