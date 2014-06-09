package com.gu.fronts.integration.test.page;

import static com.gu.fronts.integration.test.page.CssSelector.TEST_ATTR_NAME;
import static org.openqa.selenium.support.How.*;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class NetworkFrontPage extends AbstractParentPage {

    @FindBy(how = CSS, using = "["+TEST_ATTR_NAME+"=network_front_date_title]")
    private WebElement dateTitle;

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
            dateTitle.isDisplayed();
        } catch (WebDriverException e) {
            throw new RuntimeException("Page" + this.getClass().getName() + " was not properly displayed", e);
        }
        return this;
    }
}

