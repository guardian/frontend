package com.gu.fronts.integration.test.page.util;

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
 * Super class for all page objects. Contains various utilities for loading pages, checking if elements are displayed
 * etc
 */
public abstract class AbstractParentPage {

    protected WebDriver webDriver;

    protected CustomPageFactory pageFactory;

    public AbstractParentPage(WebDriver webDriver) {
        this.webDriver = webDriver;

        // page classes are initialized by PageFactory so cant use spring autowiring
        this.pageFactory = new CustomPageFactory();
    }

    protected <Page> Page loadPage(Class<Page> pageClass) {
        return pageFactory.initPage(webDriver, pageClass);
    }

    public HeaderPage header() {
        if (this instanceof HeaderPage) {
            throw new RuntimeException("Cannot get header from HeaderPage as it is the header");
        }
        return pageFactory.initPage(webDriver, HeaderPage.class);
    }

    public FooterPage footer() {
        if (this instanceof FooterPage) {
            throw new RuntimeException("Cannot get footer from FooterPage as it is the footer");
        }
        return pageFactory.initPage(webDriver, FooterPage.class);
    }

    /**
     * The purpose of this method is to check all elements which should always exist when loading a page. It checks that
     * all provided elements are displayed and if not will throw an AssertionError with a message detailing which
     * elements are not displayed.
     */
    protected void isDisplayed(WebElement... elementsToCheck) {
        List<String> errors = new ArrayList<>();
        for (WebElement webElement : elementsToCheck) {
            checkElementDisplayedAndCreateError(webElement, errors);
        }
        if (CollectionUtils.isNotEmpty(errors)) {
            throw new AssertionError("Page :" + this.getClass().getName() + " was not displayed properly due to: "
                    + getErrorMessages(errors));
        }
    }

    /**
     * Page Objects need to implement this class and then call {@link #isDisplayed(WebElement...)} with the elements
     * which need to be displayed for the page to load properly and can also, optionally, do some additional checks
     */
    protected abstract Object isDisplayed();

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
