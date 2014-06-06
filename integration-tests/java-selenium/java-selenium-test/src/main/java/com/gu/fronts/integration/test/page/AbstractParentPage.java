package com.gu.fronts.integration.test.page;

import org.openqa.selenium.WebDriver;

/**
 * Super class for all page objects
 */
public class AbstractParentPage {

    protected WebDriver webDriver;

    public AbstractParentPage(WebDriver webDriver) {
	this.webDriver = webDriver;
    }
}
