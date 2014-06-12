package com.gu.fronts.integration.test.page;

import static com.gu.fronts.integration.test.common.util.CssSelector.TEST_ATTR_NAME;
import static com.gu.fronts.integration.test.page.util.PageElementHelper.elementIsALink;
import static java.lang.String.format;
import static org.openqa.selenium.support.How.CSS;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.gu.fronts.integration.test.page.util.AbstractParentPage;

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
        super.isDisplayed(editions, logo);
        return this;
    }

    public NetworkFrontPage clickLogo() {
        logo.click();
        return loadPage(NetworkFrontPage.class);
    }

    public NetworkFrontPage selectUSEdition() {
        editionUS.click();
        return pageFactoryHelper.loadPage(webDriver, NetworkFrontPage.class);
    }

    public NetworkFrontPage selectUKEdition() {
        editionUK.click();
        return pageFactoryHelper.loadPage(webDriver, NetworkFrontPage.class);
    }

    public NetworkFrontPage selectAUEdition() {
        editionAU.click();
        return pageFactoryHelper.loadPage(webDriver, NetworkFrontPage.class);
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

    public HeaderPage usEditionPresent() {
        super.isDisplayed(editionUS);
        return this;
    }

    public HeaderPage auEditionPresent() {
        super.isDisplayed(editionAU);
        return this;
    }
}
