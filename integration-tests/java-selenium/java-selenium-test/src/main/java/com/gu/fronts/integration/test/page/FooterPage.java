package com.gu.fronts.integration.test.page;

import static com.gu.fronts.integration.test.common.util.CssSelector.TEST_ATTR_NAME;
import static org.openqa.selenium.support.How.CSS;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.gu.fronts.integration.test.page.util.AbstractParentPage;

public class FooterPage extends AbstractParentPage {

    @FindBy(how = CSS, using = "[" + TEST_ATTR_NAME + "=copyright]")
    private WebElement copyright;

    @FindBy(how = CSS, using = "[" + TEST_ATTR_NAME + "=logo_footer]")
    private WebElement logo;

    public FooterPage(WebDriver webDriver) {
        super(webDriver);
    }

    public FooterPage isDisplayed() {
        super.isDisplayed(copyright, logo);
        return this;
    }

    public NetworkFrontPage clickLogo() {
        logo.click();
        return pageFactoryHelper.loadPage(webDriver, NetworkFrontPage.class);
    }

}
