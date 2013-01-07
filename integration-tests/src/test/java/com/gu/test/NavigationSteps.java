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
    	//adding a wait for the element to appear
    	webDriver.waitForElement(By.id(tabId));
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
    	if (menuState.equals("open")) {
    	    webDriver.waitForVisible(By.id(menuId));
    	} else {
    	    webDriver.waitForHidden(By.id(menuId)); 
    	}
    }
    
    @Given("^the \"(Top stories|Sections)\" menu is (open|close)$")
    public void the_menu_is(String tabName, String menuState) throws Throwable {
    	String menuId = tabName.toLowerCase().replace(" ", "") + "-header";
    	// if it's not in the correct state, click it
    	if (menuState.equals("open")) {
    		I_click_the_tab(tabName);
    		// NOTE - HACKY McHACKSON- js is coded to not allow toggling of nav tab quicker than 400ms
    		Thread.sleep(400);
    		// wait for it to be visible
    		webDriver.waitForVisible(By.id(menuId));
    	}
    }
    
    @When("^I click on a top story$")
    public void I_click_on_a_top_story_link() throws Throwable {
    	// get the first top story
    	webDriver.findElement(By.cssSelector("#topstories-header li a")).click();
    }
    
    @Then("^the top story link should have a (.*) of (.*)$")
    public void the_top_story_link_should_have_a_of(String cssProperty, String expectedColor) throws Throwable {
        // confirm it has the correct css color
    	Assert.assertEquals(expectedColor, webDriver.getElementCssValue(By.cssSelector("#topstories-header li a"), cssProperty));
    }
    
}