package com.gu.fronts.integration.test.page;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute;
import com.gu.fronts.integration.test.page.util.AbstractParentPage;

public class NetworkFrontPage extends AbstractParentPage {
    @FindByTestAttribute(using = "network-front-date-title")
    private WebElement dateTitle;

    public NetworkFrontPage(WebDriver webDriver) {
        super(webDriver);
    }

    public NetworkFrontPage isDisplayed() {
        // TODO find/create a better element which uniquely identifies the network front start page
        assertExists(dateTitle);
        return this;
    }

    public NetworkFrontDateBox dateBox() {
        return loadPage(NetworkFrontDateBox.class);
    }

    public AllFaciaContainersPage containers() {
        // TODO Auto-generated method stub
        return null;
    }
}
