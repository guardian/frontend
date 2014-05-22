package com.gu.test.helpers;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;

public class WaitHelper {

    public static void waitForArticleLoad(WebDriver driver) {
        ExpectedCondition<Boolean> expectation = new ExpectedCondition<Boolean>() {
            public Boolean apply(WebDriver driver) {
                return ((JavascriptExecutor) driver).executeScript("return document.readyState")
                        .equals("complete");
            }
        };

        Wait<WebDriver> wait = new WebDriverWait(driver, 30);
        try {
            wait.until(expectation);
        } catch (Throwable error) {
            throw new RuntimeException("Timeout waiting for Page Load Request to complete.");
        }
    }
}
