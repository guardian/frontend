package com.gu.test;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.events.AbstractWebDriverEventListener;

public class EventListener extends AbstractWebDriverEventListener {

	protected String lastClickedElementsHref;

	@Override
	public void beforeClickOn(WebElement element, WebDriver driver) {
		// store this element's href (if there is one)
		lastClickedElementsHref = element.getAttribute("href");
	}

}