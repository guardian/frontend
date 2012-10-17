package com.gu.test;

import junit.framework.Assert;

import org.openqa.selenium.*;
import cucumber.annotation.en.*;

public class NavigationSteps {

    private final SharedDriver webDriver;

    public NavigationSteps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }
    
    @When("^I click the \"(Top stories|Sections)\" tab$")
    public void I_click_the_tab(String tabName) throws Throwable {
    	String tabId = tabName.toLowerCase().replace(" ", "") + "-control-header";
    	// click the tab
	    webDriver.findElement(By.id(tabId)).click();
    }

    @Then("^I'm shown the top (\\d+) stories from the Guardian site$")
    public void Im_shown_the_top_stories_from_the_Guardian_site(int numOfTopStories) throws Throwable {
    	// assert stories are displayed
    	WebElement topStories = webDriver.findElement(By.id("topstories-header"));
    	Assert.assertTrue(topStories.isDisplayed());
    	// assert it has the correct number of stories
    	Assert.assertEquals(numOfTopStories, topStories.findElements(By.tagName("li")).size());
    }
    
    @When("^I have visited some stories within the top stories list$")
    public void I_have_visited_some_stories_within_the_top_stories_list() throws Throwable {
        
    }

    @Then("^the stories I have visited will have a visited state$")
    public void the_stories_I_have_visited_will_have_a_visited_state() throws Throwable {
        
    }
    
}