package com.gu.test;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedCondition;

public class WaitFor {

	public static ExpectedCondition<Boolean> cssToBe(final By locator, final String cssProp, final String cssValue) {

		return new ExpectedCondition<Boolean>() {

			private String currentCssValue = "";

			public Boolean apply(WebDriver driver) {
				WebElement element = driver.findElement(locator);
				currentCssValue = element.getCssValue(cssProp);
				// remove px from zero value (consistent across drivers)
				if (currentCssValue.equals("0px")) {
					currentCssValue = "0";
				}
				return cssValue.equals(currentCssValue);
			}

			@Override
			public String toString() {
				return String.format(
					"css property \"%s\" to be \"%s\". Current value: \"%s\"", cssProp, cssValue, currentCssValue
				);
			}

		};
	}

}