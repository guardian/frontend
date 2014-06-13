package com.gu.fronts.integration.test.page;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute;
import com.gu.fronts.integration.test.page.util.AbstractParentPage;

public class NetworkFrontPage extends AbstractParentPage {
    @FindByTestAttribute(using = "network_front_date_title")
    private WebElement dateTitle;

    public NetworkFrontPage(WebDriver webDriver) {
        super(webDriver);
    }

    public NetworkFrontPage isDisplayed() {
        super.exists(dateTitle);
        return this;
    }
}
