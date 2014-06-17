package com.gu.fronts.integration.test.page.util;

import static org.openqa.selenium.support.ui.ExpectedConditions.elementToBeClickable;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

public class PageElementHelper {

    private static final int CLICKABLE_WAIT = 2;

    public static boolean elementClickable(WebElement element, WebDriver webDriver) {
        try {
            WebDriverWait wait = new WebDriverWait(webDriver, CLICKABLE_WAIT);
            wait.until(elementToBeClickable(element));
        } catch (TimeoutException e) {
            return false;
        }
        return true;
    }

    public static boolean elementIsALink(WebElement element) {
        return "a".equalsIgnoreCase(element.getTagName());
    }

    public static WebElement findElementBy(WebElement baseWebElement, By by) {
        try {
            return baseWebElement.findElement(by);
        } catch (Exception e) {
            throw new AssertionError("Error locating element using parent tag:" + baseWebElement.getTagName(), e);
        }
    }

    public static WebElement getLinkFrom(WebElement rootElement) {
        // not the most robust way to get the link but dont want to put too many test attributes on the pages
        return rootElement.findElement(By.cssSelector("a"));
    }

    public static WebElement waitUntilVisible(WebElement element, int timeout, WebDriver webDriver) {
        return (new WebDriverWait(webDriver, timeout)).until(visibilityOf(element));
    }
}
