package com.gu.fronts.integration.test.page;

import static com.gu.fronts.integration.test.common.page.CssSelector.TEST_ATTR_NAME;
import static org.openqa.selenium.support.How.CSS;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.gu.fronts.integration.test.common.page.AbstractParentPage;

public class NetworkFrontPage extends AbstractParentPage {

    @FindBy(how = CSS, using = "[" + TEST_ATTR_NAME + "=network_front_date_title]")
    private WebElement dateTitle;

    public NetworkFrontPage(WebDriver webDriver) {
        super(webDriver);
    }

    public NetworkFrontPage isDisplayed(boolean checkHeaderAndFooter) {
        super.isDisplayed(checkHeaderAndFooter, dateTitle);
        return this;
    }
}
