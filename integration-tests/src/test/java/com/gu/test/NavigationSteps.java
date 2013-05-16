package com.gu.test;

import cucumber.api.java.en.Given;
import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class NavigationSteps {

    private final SharedDriver webDriver;

    public NavigationSteps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }
    
    @When("^I click the \"(Top stories|Sections)\" tab$")
    public void I_click_the_tab(String tabName) throws Throwable {
    	String tabClass = "control--" + tabName.toLowerCase().replace(" ", "");
    	//adding a wait for the element to appear
    	webDriver.waitForElement(By.className(tabClass));
    	// click the tab
    	webDriver.click(webDriver.findElement(By.className(tabClass)));
    }

    @Then("^I'm shown the top (\\d+) stories from the Guardian site$")
    public void Im_shown_the_top_stories_from_the_Guardian_site(int numOfTopStories) throws Throwable {
    	// assert stories are displayed
    	WebElement topStories = webDriver.findElement(By.className("topstories"));
    	assertTrue(topStories.isDisplayed());
    	// assert it has the correct number of stories
    	assertEquals(numOfTopStories, topStories.findElements(By.tagName("li")).size());
    }

    @Then("^the \"(Top stories|Sections)\" menu should (open|close)$")
    public void the_menu_should(String tabName, String menuState) throws Throwable {
    	String menuId = "nav-popup-" + tabName.toLowerCase().replace(" ", "");
    	if (menuState.equals("open")) {
    	    webDriver.waitForVisible(By.className(menuId));
    	} else {
    	    webDriver.waitForHidden(By.className(menuId)); 
    	}
    }
    
    @Given("^the \"(Top stories|Sections)\" menu is (open|close)$")
    public void the_menu_is(String tabName, String menuState) throws Throwable {
    	String menuId = "nav-popup-" + tabName.toLowerCase().replace(" ", "");
    	// if it's not in the correct state, click it
    	if (menuState.equals("close")) {
    		I_click_the_tab(tabName);
    		// NOTE - HACKY McHACKSON- js is coded to not allow toggling of nav tab quicker than 400ms
    		Thread.sleep(400);
    		// wait for it to be visible
    		webDriver.waitForVisible(By.className(menuId));
    	}
    }
    
    @When("^I click on a top story$")
    public void I_click_on_a_top_story_link() throws Throwable {
    	// get the first top story
    	webDriver.click(webDriver.findElement(By.cssSelector(".nav-popup-topstories li a")));
    }
    
    @Then("^the top story link should have a (.*) of (.*)$")
    public void the_top_story_link_should_have_a_of(String cssProperty, String expectedColor) throws Throwable {
        // confirm it has the correct css color
    	assertEquals(expectedColor, webDriver.getElementCssValue(By.cssSelector(".nav-popup-topstories li a"), cssProperty));
    }
    
}