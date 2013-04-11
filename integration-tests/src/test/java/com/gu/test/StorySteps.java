package com.gu.test;

import java.util.List;

import static org.junit.Assert.*;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import cucumber.api.java.en.Given;
import cucumber.api.java.en.Then;


public class StorySteps {

    private final SharedDriver webDriver;

    protected String story = "/stories/mid-staffs";

    public StorySteps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }
    
    @Given("^I am on an story$")
    public void I_am_on_an_article() throws Throwable {
        webDriver.open(story);
    }

    @Then("^Latest developments is displayed$")
    public void Latest_developments_is_displayed() throws Throwable {
        WebElement heading = webDriver.waitForElement(By.cssSelector(".story-latest .story-sub-head"));
        assertTrue(heading.getText().equals("Latest"));
    }

    @Then("^Latest stories is displayed$")
    public void Latest_stories_is_displayed() throws Throwable {
        webDriver.waitForElement(By.id("js-latest-stories"));
    }

    @Then("^the first (\\d+) blocks from article is shown$")
    public void the_first_blocks_from_article_is_shown(int stories) throws Throwable {
        List<WebElement> s = webDriver.findElements(By.cssSelector(".story-latest .article-body > *"));
        assertEquals((s.size() - 2), stories);
    }

    @Then("^a \"([^\"]*)\" of events is displayed$")
    public void a_of_events_is_displayed(String cssSelector) throws Throwable {
        webDriver.findElement(By.className(cssSelector));
    }

}
