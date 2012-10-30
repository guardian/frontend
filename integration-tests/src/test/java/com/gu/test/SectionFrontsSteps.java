package com.gu.test;

import java.util.List;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.pagefactory.ByChained;

import cucumber.annotation.en.Given;

public class SectionFrontsSteps {

	private final SharedDriver webDriver;

	public SectionFrontsSteps(SharedDriver webDriver) {
		this.webDriver = webDriver;
	}

	@Given("^I am on the '(.*)' section front$")
	public void I_am_on_a_section_front(String sectionFront) throws Throwable {
		webDriver.open("/" + sectionFront);
	}
	
	@Given("^I should see up to (\\d+) '([^']*)' top stories$")
	public void I_should_see_up_to_top_stories(int numOfTopStories, String subSectionTitle) throws Throwable {
		WebElement subSectionLink = webDriver.findElement(
			new ByChained(By.id("front-container"), By.linkText(subSectionTitle))
		);
		// get the associated (visible) trails
		List<WebElement> trails = subSectionLink.findElements(By.xpath("../following-sibling::div/ul[1]/li"));
		Assert.assertTrue(trails.size() <= numOfTopStories);
	}
	@Given("^any more than (\\d+) '([^']*)' top stories should be hidden$")
	public void any_more_than_top_stories_should_be_hidden(int numOfTopStories, String subSectionTitle) throws Throwable {
		WebElement subSectionLink = webDriver.findElement(
			new ByChained(By.id("front-container"), By.linkText(subSectionTitle))
		);
		// get the associated (invisible) trails
		List<WebElement> trails = subSectionLink.findElements(By.xpath("../following-sibling::div/ul[2]/li"));
		Assert.assertTrue(trails.size() <= numOfTopStories);
	}
	
}