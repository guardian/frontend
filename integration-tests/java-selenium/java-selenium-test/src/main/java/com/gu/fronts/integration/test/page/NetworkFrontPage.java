package com.gu.fronts.integration.test.page;

import static org.openqa.selenium.support.How.CLASS_NAME;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class NetworkFrontPage extends AbstractParentPage {

    @FindBy(how = CLASS_NAME, using = "container__title")
    private WebElement titleContainer;

    public NetworkFrontPage(WebDriver webDriver) {
        super(webDriver);
    }

    /**
     * Checks if the page is being properly displayed or not. Throws AssertionError if not.
     * 
     * @return the page
     * @throws AssertionError
     */
    public NetworkFrontPage isDisplayed() {
        try {
            titleContainer.isDisplayed();
        } catch (WebDriverException e) {
            throw new RuntimeException("Page" + this.getClass().getName() + " was not properly displayed", e);
        }
        return this;
    }
}
