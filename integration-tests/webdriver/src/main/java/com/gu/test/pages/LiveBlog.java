package com.gu.test.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LiveBlog {
    private WebDriver driver;

    public LiveBlog(WebDriver driver) {
        this.driver = driver;
    }

    public void viewAllUpdates() {
        driver.findElement(By.cssSelector(".button--show-more")).click();
    }

    public boolean hasTruncation() {
        return driver.findElement(By.cssSelector(".truncated-block")).isDisplayed();
    }
}
