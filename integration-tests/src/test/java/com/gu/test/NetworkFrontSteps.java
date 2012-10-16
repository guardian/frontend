package com.gu.test;

import java.util.List;
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
	
	@Then("^I can click \"([^\"]*)\" to (collapse|expand) a section$")
	public void I_can_click_to_a_section(String buttonText, String action) throws Throwable {
	    // get the headers
		List<WebElement> sections = webDriver.findElements(
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
	
	@Then("^\"(Top stories|Sections)\" tab is (hidden|shown)$")
	public void tab_is(String tabName, String tabState) throws Throwable {
		String tabId = tabName.toLowerCase().replace(" ", "") + "-control-header";
	    WebElement tab = webDriver.findElement(By.id(tabId));
	    // confirm element is shown/hidden
	    Assert.assertEquals(tabState.equals("shown"), tab.isDisplayed());
	}

	@Given("^I hide a section$")
	public void I_hide_a_section() throws Throwable {
	    // hide the first section
		webDriver.findElement(By.cssSelector("section.front-section .toggle-trailblock"))
		.click();
	}

	@When("^I navigate to an article page and back to the network front$")
	public void I_navigate_to_an_article_page_and_back_to_the_network_front() throws Throwable {
	    // click on the first visible article
		webDriver.findElement(By.cssSelector(".rolled-out .trail h2 a"))
			.click();
		// navigate back to the front (by clicking the logo)
		webDriver.findElement(By.cssSelector("#header a"))
			.click();
	}

	@Then("^the collapsed section will stay collapsed$")
	public void the_collapsed_section_will_stay_collapsed() throws Throwable {
	    // confirm the first section is collapsed still
		WebElement section = webDriver.findElement(By.cssSelector("section.front-section"));
		// confirm toggle text is 'Show'
		Assert.assertEquals("Show", section.findElement(By.className("toggle-trailblock")).getText());
		// confirm trailblock is hidden
		Assert.assertEquals("0px", section.findElement(By.className("trailblock")).getCssValue("max-height"));
	}
	
}