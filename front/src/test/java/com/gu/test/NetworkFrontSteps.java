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

	private NetworkFrontTest fendadmin;

	@Given("^I visit the front page$")
	public void i_visit_the_front_page() throws Throwable {
		fendadmin = new NetworkFrontTest();
		fendadmin.open(fendadmin.getHost() + "/");
	}
	
	@Then("^expanders for each block should show a maximum of (\\d+) stories$")
	public void expanders_for_each_block_should_show_a_maximum_of_stories(int numOfStories) throws Throwable {
		// get all the trailblocks
		List<WebElement> trailblocks = fendadmin.getDriver().findElements(By.className("trailblock"));
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

	@After
	public void tearDown(){
		fendadmin.close();
	}
}