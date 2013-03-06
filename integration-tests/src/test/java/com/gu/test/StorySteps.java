package com.gu.test;

import java.util.List;

import junit.framework.Assert;
import junitx.framework.StringAssert;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import cucumber.annotation.en.Given;
import cucumber.annotation.en.Then;
import cucumber.annotation.en.When;


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
        WebElement heading = webDriver.findElement(By.cssSelector(".story-latest .article-headline"));
        Assert.assertTrue(heading.getText().equals("Latest developments"));
    }

    @Then("^Latest stories is displayed$")
    public void Latest_stories_is_displayed() throws Throwable {
        webDriver.findElement(By.id("js-latest-stories"));
    }

    @Then("^the first (\\d+) blocks from article is shown$")
    public void the_first_blocks_from_article_is_shown(int stories) throws Throwable {
        List<WebElement> s = webDriver.findElements(By.cssSelector(".story-latest .article-body"));
        Assert.assertTrue(s.size() == stories);
    }

    @Then("^a \"([^\"]*)\" of events is displayed$")
    public void a_of_events_is_displayed(String cssSelector) throws Throwable {
        webDriver.findElement(By.className(cssSelector));
    }

    @When("^Back to top is clicked$")
    public void Back_to_top_is_clicked() throws Throwable {

    }

    @Then("^story page scrolls to the top$")
    public void story_page_scrolls_to_the_top() throws Throwable {
        //get href value of the element (back to the top) to locate for example "top" div is show above the container as a way for confirming the Back to the top will work
        String var = webDriver.findElement(By.linkText("Back to top")).getAttribute("href");
        Assert.assertTrue(webDriver.findElements(By.id(var.substring(var.indexOf("#")+1))).size() > 0);
    }

}
