package com.gu.test;

import java.util.List;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import cucumber.annotation.en.Given;
import cucumber.annotation.en.Then;

public class SectionFrontsSteps {

	private final SharedDriver webDriver;

	public SectionFrontsSteps(SharedDriver webDriver) {
		this.webDriver = webDriver;
	}

	@Given("^I am on the '(.*)' section front$")
	public void I_am_on_a_section_front(String sectionFront) throws Throwable {
		webDriver.open("/" + sectionFront);
	}
	
	@Then("^I should see up to (\\d+) '([^']*)' top stories$")
	public void I_should_see_up_to_top_stories(int numOfTopStories, String subSectionTitle) throws Throwable {
		// get the trailblock associated with this sub-section
		WebElement trailblock = findTrailblock(subSectionTitle);
		// get the (visible) trailblock
		WebElement visibleTrailblock = trailblock.findElement(By.xpath("ul[not(contains(@class, 'panel'))]"));
		// shouldn't show any more than n stories
		Assert.assertTrue(visibleTrailblock.findElements(By.className("trail")).size() <= numOfTopStories);
	}
	
	@Then("^any more than (\\d+) '([^']*)' top stories should be hidden$")
	public void any_more_than_top_stories_should_be_hidden(int numOfTopStories, String subSectionTitle) throws Throwable {
		// get the trailblock associated with this sub-section
		WebElement trailblock = findTrailblock(subSectionTitle);
		// get the (invisible) trailblock
		WebElement hiddenTrailblock = trailblock.findElement(By.cssSelector("ul.panel"));
		// make sure the num of trails is less than the number of stories
		List<WebElement> hiddenTrails = hiddenTrailblock.findElements(By.className("trail"));
		Assert.assertTrue(hiddenTrails.size() <= numOfTopStories);
		// make sure they're hidden
		Assert.assertEquals("0px", hiddenTrailblock.getCssValue("max-height"));
	}
	
	protected WebElement findTrailblock(String name) {
		// get the trailblock associated with this sub-section
		return webDriver.findElement(
			By.xpath("//section[.//h1/text()='" + name + "']/div[contains(@class, 'trailblock')]")
		);
	}
	
}