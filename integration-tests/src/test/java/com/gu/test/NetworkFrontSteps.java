package com.gu.test;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import junit.framework.Assert;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import cucumber.annotation.en.Given;
import cucumber.annotation.en.Then;

public class NetworkFrontSteps {

    private final SharedDriver webDriver;

    public NetworkFrontSteps(SharedDriver webDriver) {
        this.webDriver = webDriver;
    }
	
	@Then("^expanders for each block should show a maximum of (\\d+) stories$")
	public void expanders_for_each_block_should_show_a_maximum_of_stories(int numOfStories) throws Throwable {
		// get all the trailblocks
		List<WebElement> trailblocks = webDriver.findElements(By.className("trailblock"));
		for (WebElement trailblock : trailblocks) {
			// confirm expander
			List<WebElement> expanders = trailblock.findElements(By.className("cta"));
			if (expanders.size() == 1) {
				WebElement expander = expanders.get(0); 
				// confirm text and items are less than numOfStories
				String expanderText = expander.getText();
				Matcher m = Pattern.compile("Show (\\d+) more").matcher(expanderText);
				// find the number shown
				m.find();
				int actualNumOfStories = Integer.parseInt(m.group(1));
				Assert.assertTrue(actualNumOfStories <= numOfStories);
				// check number of items in expander
				Assert.assertEquals(
					trailblock.findElements(By.cssSelector(".panel .trail")).size(), actualNumOfStories
				);
			}
		}
	}
	
	@Then("^I can click \"([^\"]*)\" to (collapse|expand) a section$")
	public void I_can_click_to_a_section(String buttonText, String action) throws Throwable {
	    // get the headers
		List<WebElement> sections = webDriver.findElements(
			By.cssSelector("section.front-section:nth-child(n+2)")
		);
		for(WebElement section : sections) {
			// click button
			WebElement button = section.findElement(By.cssSelector(".toggle-trailblock"));
			Assert.assertEquals(buttonText, button.getText());
			button.click();
			// and wait a second for it to close
			webDriver.waitFor(1000);
			// confirm correct class
			String direction = (action.equals("collapse")) ? "up" : "out";
			WebElement trailblock = section.findElement(By.cssSelector(".trailblock.rolled-" + direction));
			// confirm css
			if (action.equals("collapse")) {
				Assert.assertEquals("0px", trailblock.getCssValue("max-height"));
			} else {
				Assert.assertEquals("9999px", trailblock.getCssValue("max-height"));
			}
		}
 	}

	@Given("^I hide a section$")
	public void I_hide_a_section() throws Throwable {
		By firstSectionToggle = By.cssSelector("#front-container section:nth-child(2) .toggle-trailblock");
		// wait for the toggle to become visible
		webDriver.isVisibleWait(firstSectionToggle);
	    // hide the first section
		webDriver.findElement(firstSectionToggle).click();
	}

	@Then("^the collapsed section will stay collapsed$")
	public void the_collapsed_section_will_stay_collapsed() throws Throwable {
		String firstSectionLocator = "#front-container section:nth-child(2) ";
		// wait for first section to collapse
		webDriver.hasTextWait(
			By.cssSelector(firstSectionLocator + ".toggle-trailblock"), "Show"
		);
		// and wait a second for it to close
		webDriver.waitFor(1000);
		// confirm trailblock has 0 height
		Assert.assertEquals(
			"0px", webDriver.findElement(By.cssSelector(firstSectionLocator + ".trailblock")).getCssValue("max-height")
		);
	}
	
}