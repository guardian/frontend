package com.gu.test.pages;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;

public class SectionFront {

    private WebDriver driver;
    private String section;

    public SectionFront(WebDriver driver, String section) {
        this.driver = driver;
        this.section = section;
    }

    public void waitForPageLoad(WebDriver driver) {
        ExpectedCondition<Boolean> expectation = new ExpectedCondition<Boolean>() {
            public Boolean apply(WebDriver driver) {
                return ((JavascriptExecutor) driver).executeScript("return document.readyState")
                        .equals("complete");
            }
        };
    }

}