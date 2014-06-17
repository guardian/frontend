package com.gu.fronts.integration.test.page.common;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute;
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage;
import com.gu.fronts.integration.test.page.util.AbstractParentPage;

public class FooterPage extends AbstractParentPage {

    @FindByTestAttribute(using = "copyright")
    private WebElement copyright;

    @FindByTestAttribute(using = "logo_footer")
    private WebElement logo;

    public FooterPage(WebDriver webDriver) {
        super(webDriver);
    }

    public FooterPage isDisplayed() {
        super.assertExists(copyright, logo);
        return this;
    }

    public NetworkFrontPage clickLogo() {
        logo.click();
        return pageFactory.initPage(webDriver, NetworkFrontPage.class);
    }

}
