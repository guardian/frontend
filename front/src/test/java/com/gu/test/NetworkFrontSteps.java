package com.gu.test;

import java.util.*;
import java.util.regex.*;
import java.text.SimpleDateFormat;
import org.openqa.selenium.*;
import cucumber.annotation.After;
import cucumber.annotation.en.*;
import cucumber.runtime.PendingException;
import junit.framework.Assert;

public class NetworkFrontSteps {

	private NetworkFrontTest networkFront;

	@Given("^I visit the front page$")
	public void i_visit_the_front_page() throws Throwable {
		networkFront = new NetworkFrontTest();
		networkFront.open(networkFront.getHost() + "/");
	}
	
	@Then("^expanders for each block should show a maximum of (\\d+) stories$")
	public void expanders_for_each_block_should_show_a_maximum_of_stories(int numOfStories) throws Throwable {
		// get all the trailblocks
		List<WebElement> trailblocks = networkFront.getDriver().findElements(By.className("trailblock"));
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
		List<WebElement> sections = networkFront.getDriver().findElements(
			By.cssSelector("section.front-section")
		);
		for(WebElement section : sections) {
			// click button
			WebElement button = section.findElement(By.cssSelector(".front-section-head .toggle-trailblock"));
			Assert.assertEquals(buttonText, button.getText());
			button.click();
			// and wait half a second for it to close
			Thread.sleep(1000);
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
	
	@After
	public void tearDown(){
		networkFront.close();
	}
}