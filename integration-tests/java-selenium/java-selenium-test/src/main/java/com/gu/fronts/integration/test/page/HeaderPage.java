package com.gu.fronts.integration.test.page;

import static com.gu.fronts.integration.test.common.page.CssSelector.TEST_ATTR_NAME;
import static com.gu.fronts.integration.test.common.page.PageElementHelper.elementIsALink;
import static com.gu.fronts.integration.test.common.page.PageFactoryHelper.loadPage;
import static java.lang.String.format;
import static org.openqa.selenium.support.How.CSS;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.gu.fronts.integration.test.common.page.AbstractParentPage;

public class HeaderPage extends AbstractParentPage {

    @FindBy(how = CSS, using = "[" + TEST_ATTR_NAME + "=editions]")
    private WebElement editions;

    @FindBy(how = CSS, using = "[" + TEST_ATTR_NAME + "=edition-US]")
    private WebElement editionUS;

    @FindBy(how = CSS, using = "[" + TEST_ATTR_NAME + "=edition-UK]")
    private WebElement editionUK;

    @FindBy(how = CSS, using = "[" + TEST_ATTR_NAME + "=edition-AU]")
    private WebElement editionAU;

    @FindBy(how = CSS, using = "[" + TEST_ATTR_NAME + "=logo]")
    private WebElement logo;

    public HeaderPage(WebDriver webDriver) {
        super(webDriver);
    }

    public HeaderPage isDisplayed() {
        super.isDisplayed(false, editions, logo);
        return this;
    }

    public NetworkFrontPage clickLogo() {
        logo.click();
        return loadPage(NetworkFrontPage.class, webDriver);
    }

    public NetworkFrontPage selectUSEdition() {
        editionUS.click();
        return loadPage(NetworkFrontPage.class, webDriver);
    }

    public NetworkFrontPage selectUKEdition() {
        editionUK.click();
        return loadPage(NetworkFrontPage.class, webDriver);
    }

    public NetworkFrontPage selectAUEdition() {
        editionAU.click();
        return loadPage(NetworkFrontPage.class, webDriver);
    }

    public HeaderPage usEditionSelected() {
        return editionSelected(editionUS);
    }

    public HeaderPage ukEditionSelected() {
        return editionSelected(editionUK);
    }

    public HeaderPage auEditionSelected() {
        return editionSelected(editionAU);
    }

    private HeaderPage editionSelected(WebElement editionElement) throws AssertionError {
        if (elementIsALink(editionElement)) {
            throw new AssertionError(format("%s was not selected", editionElement.getAttribute(TEST_ATTR_NAME)));
        }
        return this;
    }
}
