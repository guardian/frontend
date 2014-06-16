package com.gu.fronts.integration.test.page;

import java.util.Date;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.fw.selenium.FindByTestAttribute;
import com.gu.fronts.integration.test.page.util.AbstractParentPage;
import com.gu.fronts.integration.test.page.util.NetworkFrontDate;

public class NetworkFrontDateBox extends AbstractParentPage {

    @FindByTestAttribute(using = "network-front-date-title")
    private WebElement dateTitle;

    @FindByTestAttribute(using = "network-front-day-month")
    private WebElement dayOfMonth;

    public NetworkFrontDateBox(WebDriver webDriver) {
        super(webDriver);
    }

    @Override
    public NetworkFrontDateBox isDisplayed() {
        assertExists(dateTitle);
        return this;
    }

    public Date getDate() {
        return new NetworkFrontDate(dateTitle.getText()).parseToDate();
    }

    public String getDayOfWeek() {
        return new NetworkFrontDate(dateTitle.getText()).getDayOfWeek();
    }

}
