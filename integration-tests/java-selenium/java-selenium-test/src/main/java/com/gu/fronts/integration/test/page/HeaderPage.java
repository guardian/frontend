package com.gu.fronts.integration.test.page;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute;
import com.gu.fronts.integration.test.page.util.AbstractParentPage;

public class HeaderPage extends AbstractParentPage {

    @FindByTestAttribute(using = "logo")
    private WebElement logo;

    public HeaderPage(WebDriver webDriver) {
        super(webDriver);
    }

    public HeaderPage isDisplayed() {
        super.exists(logo);
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
