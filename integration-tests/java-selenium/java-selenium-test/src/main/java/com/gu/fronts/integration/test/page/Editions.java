package com.gu.fronts.integration.test.page;

import static com.gu.fronts.integration.test.common.util.CssSelector.TEST_ATTR_NAME;
import static com.gu.fronts.integration.test.page.util.PageElementHelper.elementIsALink;
import static java.lang.String.format;
import static org.openqa.selenium.support.How.CSS;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.gu.fronts.integration.test.page.util.AbstractParentPage;

public class Editions extends AbstractParentPage {
    @FindBy(how = CSS, using = "[" + TEST_ATTR_NAME + "=editions]")
    private WebElement editions;

    @FindBy(how = CSS, using = "[" + TEST_ATTR_NAME + "=edition-US]")
    private WebElement editionUS;

    @FindBy(how = CSS, using = "[" + TEST_ATTR_NAME + "=edition-UK]")
    private WebElement editionUK;

    @FindBy(how = CSS, using = "[" + TEST_ATTR_NAME + "=edition-AU]")
    private WebElement editionAU;

    public Editions(WebDriver webDriver) {
        super(webDriver);
    }

    @Override
    public Editions isDisplayed() {
        super.isDisplayed(editions, editionUK, editionUS, editionAU);
        return this;
    }
    

    public NetworkFrontPage selectUSEdition() {
        editionUS.click();
        return pageFactory.initPage(webDriver, NetworkFrontPage.class);
    }

    public NetworkFrontPage selectUKEdition() {
        editionUK.click();
        return pageFactory.initPage(webDriver, NetworkFrontPage.class);
    }

    public NetworkFrontPage selectAUEdition() {
        editionAU.click();
        return pageFactory.initPage(webDriver, NetworkFrontPage.class);
    }

    public Editions usEditionSelected() {
        return editionSelected(editionUS);
    }

    public Editions isUkEditionSelected() {
        return editionSelected(editionUK);
    }

    public Editions auEditionSelected() {
        return editionSelected(editionAU);
    }

    private Editions editionSelected(WebElement editionElement) throws AssertionError {
        if (elementIsALink(editionElement)) {
            throw new AssertionError(format("%s was not selected", editionElement.getAttribute(TEST_ATTR_NAME)));
        }
        return this;
    }

    public Editions usUsEditionPresent() {
        super.isDisplayed(editionUS);
        return this;
    }

    public Editions isAuEditionPresent() {
        super.isDisplayed(editionAU);
        return this;
    }

}
