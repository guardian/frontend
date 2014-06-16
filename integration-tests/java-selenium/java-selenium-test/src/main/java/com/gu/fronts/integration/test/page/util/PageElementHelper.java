package com.gu.fronts.integration.test.page.util;

import static org.openqa.selenium.support.ui.ExpectedConditions.elementToBeClickable;

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
}
