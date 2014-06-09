package com.gu.fronts.integration.test.common.page;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.page.FooterPage;
import com.gu.fronts.integration.test.page.HeaderPage;

/**
 * Super class for all page objects
 */
public class AbstractParentPage {

    protected WebDriver webDriver;

    public AbstractParentPage(WebDriver webDriver) {
        this.webDriver = webDriver;
    }

    public HeaderPage header() {
        if (this instanceof HeaderPage) {
            throw new RuntimeException("Cannot get header from HeaderPage as it is the header");
        }
        return PageFactoryHelper.loadPage(HeaderPage.class, webDriver);
    }

    public FooterPage footer() {
        if (this instanceof FooterPage) {
            throw new RuntimeException("Cannot get footer from FooterPage as it is the footer");
        }
        return PageFactoryHelper.loadPage(FooterPage.class, webDriver);
    }

    /**
     * The purpose of this method is to check all elements which should always exist when loading a page. It checks that
     * all provided elements are displayed and if not will throw an AssertionError with a message detailing which
     * elements are not displayed.
     */
    protected void isDisplayed(boolean checkHeaderAndFooter, WebElement... elementsToCheck) {
        if (checkHeaderAndFooter) {
            header().isDisplayed();
            footer().isDisplayed();
        }
        List<String> errors = new ArrayList<>();
        for (WebElement webElement : elementsToCheck) {
            checkElementDisplayedAndCreateError(webElement, errors);
        }
        if (CollectionUtils.isNotEmpty(errors)) {
            throw new AssertionError("Page :" + this.getClass().getName() + " was not displayed properly due to: "
                    + getErrorMessages(errors));
        }
    }

    private String getErrorMessages(List<String> errors) {
        return StringUtils.join(errors, ",");
    }

    private void checkElementDisplayedAndCreateError(WebElement webElement, List<String> errors) {
        try {
            webElement.isDisplayed();
        } catch (WebDriverException e) {
            errors.add(e.getMessage());
        }
    }

}
