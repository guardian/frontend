package com.gu.fronts.integration.test.page;

import static com.gu.fronts.integration.test.common.util.CssSelector.TEST_ATTR_NAME;
import static org.openqa.selenium.support.How.CSS;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.gu.fronts.integration.test.page.util.AbstractParentPage;

public class HeaderPage extends AbstractParentPage {

    @FindBy(how = CSS, using = "[" + TEST_ATTR_NAME + "=logo]")
    private WebElement logo;

    public HeaderPage(WebDriver webDriver) {
        super(webDriver);
    }

    public HeaderPage isDisplayed() {
        super.isDisplayed(logo);
        return this;
    }

    public NetworkFrontPage clickLogo() {
        logo.click();
        return loadPage(NetworkFrontPage.class);
    }

    public Editions editions() {
        return pageFactory.initPage(webDriver, Editions.class);
    }
}
