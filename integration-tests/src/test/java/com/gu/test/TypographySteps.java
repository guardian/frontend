package com.gu.test;

import cucumber.api.java.en.Then;
import org.openqa.selenium.By;

import static org.junit.Assert.assertTrue;

public class TypographySteps {

	private final SharedDriver webDriver;

	public TypographySteps(SharedDriver webDriver) {
		this.webDriver = webDriver;
	}

	@Then("^the typeface should be rendered as \"([^\"]*)\"$")
	public void the_typeface_should_be_rendered_as(String fontName) throws Throwable {
		//check the font family for header contains the fontName
		 assertTrue("font was "+webDriver.getElementCssValue(By.cssSelector("h1"), "font-family"),webDriver.getElementCssValue(By.cssSelector("h1"), "font-family").contains(fontName));
	}
}