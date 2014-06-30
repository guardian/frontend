package com.gu.fronts.integration.test.page.util;

import static com.gu.fronts.integration.test.fw.selenium.ByTestAttributeSelector.TEST_ATTR_NAME;
import static org.apache.commons.collections.CollectionUtils.isNotEmpty;
import static org.openqa.selenium.support.ui.ExpectedConditions.elementToBeClickable;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

public class PageElementHelper {

    private static Log LOG = LogFactory.getLog(PageElementHelper.class);

    private static final int CLICKABLE_WAIT = 2;

    /**
     * Checks that an element is displayed and otherwise clickable
     */
    public static boolean elementClickable(WebElement element, WebDriver webDriver) {
        try {
            WebDriverWait wait = new WebDriverWait(webDriver, CLICKABLE_WAIT);
            element = wait.until(elementToBeClickable(element));
            return element != null;
        } catch (Exception e) {
            throw new AssertionError("Element was not clickable", e);
        }
    }

    public static boolean elementIsALink(WebElement element) {
        return "a".equalsIgnoreCase(element.getTagName());
    }

    public static WebElement findElementBy(WebElement baseWebElement, By by) {
        try {
            return baseWebElement.findElement(by);
        } catch (Exception e) {
            throw new AssertionError("Error locating element using parent tag with id:"
                    + baseWebElement.getAttribute(TEST_ATTR_NAME) + " using: " + by.toString(), e);
        }
    }

    public static WebElement getLinkFrom(WebElement rootElement) {
        // not the most robust way to get the link but dont want to put too many test attributes on the pages
        return rootElement.findElement(By.cssSelector("a"));
    }

    public static WebElement waitUntilVisible(WebElement element, int timeout, WebDriver webDriver) {
        return (new WebDriverWait(webDriver, timeout)).until(visibilityOf(element));
    }

    /**
     * The purpose of this method is to check all elements which should always exist when loading a page. It checks that
     * all provided elements are exists and are displayed
     */
    public static boolean existsAndDisplayed(WebElement... elementsToCheck) {
        List<String> errors = new ArrayList<>();
        for (WebElement webElement : elementsToCheck) {
            checkElementExistsAndCreateError(webElement, errors);
        }
        if (isNotEmpty(errors)) {
            LOG.warn(("Page :" + PageElementHelper.class.getName() + " was not displayed properly due to: " + getErrorMessages(errors)));
            return false;
        } else {
            return true;
        }
    }

    private static String getErrorMessages(List<String> errors) {
        return StringUtils.join(errors, ",");
    }

    private static void checkElementExistsAndCreateError(WebElement webElement, List<String> errors) {
        try {
            webElement.isDisplayed();
        } catch (WebDriverException e) {
            LOG.warn(e);
            errors.add(e.getMessage());
        }
    }
}
