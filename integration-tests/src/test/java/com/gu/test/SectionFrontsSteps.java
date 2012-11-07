package com.gu.test;

import java.util.List;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.pagefactory.ByChained;

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
		WebElement subSectionLink = webDriver.findElement(
			By.xpath("//div[@id='front-container']//h1[text()='" + subSectionTitle + "']")
		);
		// get the associated (visible) trails
		List<WebElement> trails = subSectionLink.findElements(By.xpath("../following-sibling::div/ul[1]/li[@class='trail']"));
		Assert.assertTrue(trails.size() <= numOfTopStories);
	}
	
	@Then("^any more than (\\d+) '([^']*)' top stories should be hidden$")
	public void any_more_than_top_stories_should_be_hidden(int numOfTopStories, String subSectionTitle) throws Throwable {
		WebElement subSectionLink = webDriver.findElement(
			By.xpath("//div[@id='front-container']//h1[text()='" + subSectionTitle + "']")
		);
		// get the associated (invisible) trails
		WebElement hiddenTrailblock = subSectionLink.findElement(new ByChained(By.xpath("../following-sibling::div"), By.cssSelector("ul.unstyled.panel")));
		Assert.assertTrue(hiddenTrailblock.findElements(By.tagName("li")).size() <= numOfTopStories);
		// make sure they're invisible
		webDriver.findElementWait(new ByChained(
			By.xpath("//div[@id='front-container']//h1[text()='" + subSectionTitle + "']"), By.xpath("../following-sibling::div/span[contains(@class, 'cta')]")
		));
		Assert.assertEquals("0px", hiddenTrailblock.getCssValue("max-height"));
	}
	
}