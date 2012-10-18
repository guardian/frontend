package com.gu.test;

import junit.framework.Assert;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import cucumber.annotation.en.Given;
import cucumber.annotation.en.Then;
import cucumber.annotation.en.When;

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

    @Then("^the \"(Top stories|Sections)\" menu should (open|close)$")
    public void the_menu_should(String tabName, String menuState) throws Throwable {
    	String menuId = tabName.toLowerCase().replace(" ", "") + "-header";
    	Assert.assertEquals(
			menuState.equals("open"), webDriver.findElement(By.id(menuId)).isDisplayed()
		);
    }
    
    @Given("^the \"(Top stories|Sections)\" menu is (open|close)$")
    public void the_menu_is(String tabName, String menuState) throws Throwable {
    	String menuId = tabName.toLowerCase().replace(" ", "") + "-header";
    	// if it's not in the correct state, click it
    	if (menuState.equals("open") != webDriver.findElement(By.id(menuId)).isDisplayed()) {
    		I_click_the_tab(tabName);
    	}
    }
    
    @When("^I click on a top story$")
    public void I_click_on_a_top_story_link() throws Throwable {
    	// get the first top story
    	WebElement topStory = webDriver.findElement(By.cssSelector("#topstories-header li a"));
    	topStory.click();
    }
    
    @Then("^I'm taken to that article$")
    public void Im_taken_to_that_article() throws Throwable {
    	// get last clicked element's href
    	String expectedUrl = webDriver.eventListener.lastClickedElementsHref;
    	// confirm its href is the same as current page's
    	Assert.assertEquals(expectedUrl, webDriver.getCurrentUrl());
    }
    
}