package com.gu.test.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class Article {

    private WebDriver driver;

    public Article(WebDriver driver) {
        this.driver = driver;
    }


    public String getCurrentURL() {
        return driver.getCurrentUrl();
    }

    public boolean hasRelatedContentContainer() {
        return driver.findElement(By.cssSelector(".related")).isDisplayed();
    }

    public String getFirstRelatedArticleHref() {
        return driver.findElement(By.cssSelector(".related .item__link")).getAttribute("href");
    }

    public Article goToFirstRelatedArticle() {
        driver.findElement(By.cssSelector(".related .item__link")).click();
        return new Article(driver);
    }


    public boolean hasComments() {
        return driver.findElement(By.cssSelector(".discussion-content")).isDisplayed();
    }

    public boolean hasTweets() {
        return driver.findElement(By.cssSelector(".element-tweet")).isDisplayed();
    }
}


