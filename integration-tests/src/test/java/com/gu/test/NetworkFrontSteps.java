package com.gu.test;

import java.util.*;
import java.util.regex.*;

import junit.framework.Assert;

import org.openqa.selenium.*;

import cucumber.annotation.en.*;

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
	
	// xpath to the first hideable section
	protected String sectionXpath = "//div[@id = 'front-container']/section[2]";
	protected String trailblockXpath = sectionXpath + "/div[contains(@class, 'trailblock')]";
	
	@Given("^a section is hidden$")
	public void a_section_is_hidden() throws Throwable {
		I_toggle_a_section("hide");
	}

	@When("^I (hide|show) a section$")
	public void I_toggle_a_section(String sectionState) throws Throwable {
		// wait for the toggle to become visible
		WebElement trailblockToggle = webDriver.waitForVisible(
			By.xpath(sectionXpath + "//button[contains(@class, 'toggle-trailblock')]")
		);
		String expectedTrailblockHeight = (sectionState.equals("show")) ? "none" : "0";
		// only click if not in correct state
		String actualTrailblockHeight = webDriver.findElement(By.xpath(trailblockXpath)).getCssValue("max-height");
		if (actualTrailblockHeight != expectedTrailblockHeight) {
			trailblockToggle.click();
		}
	}

	@Then("^the section will be (hidden|shown)$")
	public void the_section_will_be_toggled(String sectionState) throws Throwable {
		String expectedTrailblockHeight = (sectionState.equals("shown")) ? "none" : "0";
		// sections are hidden with css max-height
		Assert.assertTrue(webDriver.waitForCss(
			By.xpath(trailblockXpath), "max-height", expectedTrailblockHeight)
		);
	}
	
}