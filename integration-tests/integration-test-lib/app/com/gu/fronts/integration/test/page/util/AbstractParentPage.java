package com.gu.fronts.integration.test.page.util;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

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

    /**
     * The purpose of this method is to check all elements which should always exist when loading a page. It checks that
     * all provided elements are exists and are displayed
     */
    private boolean existsAndDisplayed(WebElement... elementsToCheck) {
        List<String> errors = new ArrayList<>();
        for (WebElement webElement : elementsToCheck) {
            checkElementExistsAndCreateError(webElement, errors);
        }
        if (CollectionUtils.isNotEmpty(errors)) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Page Objects need to implement this class and then call {@link #existsAndDisplayed(WebElement...)} with the
     * elements which need to be displayed for the page to load properly and can also, optionally, do some additional
     * checks
     */
    public abstract boolean isDisplayed();

    private String getErrorMessages(List<String> errors) {
        return StringUtils.join(errors, ",");
    }

    private void checkElementExistsAndCreateError(WebElement webElement, List<String> errors) {
        try {
            webElement.isDisplayed();
        } catch (WebDriverException e) {
            errors.add(e.getMessage());
        }
    }
}
