package com.gu.test;

import cucumber.api.java.en.Then;
import org.openqa.selenium.By;

import static org.junit.Assert.assertTrue;

public class TypographySteps {

	private final SharedDriver webDriver;

	public TypographySteps(SharedDriver webDriver) {
		this.webDriver = webDriver;
	}

	@Then("^the body typeface should be rendered as \"([^\"]*)\"$")
	public void the_typeface_should_be_rendered_as(String fontName) {
		//check the font family for header contains the fontName
		 assertTrue("was "+webDriver.getElementCssValue(By.className("article-body"), "font-family"),webDriver.getElementCssValue(By.className("article-body"), "font-family").contains(fontName));
	}

    @Then("^the headline typeface should be rendered as \"([^\"]*)\"$")
    public void the_headline_typeface_should_be_rendered_as(String fontName) {
        assertTrue("was "+webDriver.getElementCssValue(By.cssSelector("h1"), "font-family"),webDriver.getElementCssValue(By.cssSelector("h1"), "font-family").contains(fontName));
    }
}