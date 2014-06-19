package com.gu.test.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class Article {

    private WebDriver driver;
    private static final String COMPONENT_POPULAR_BELOW = ".article__popular div#tabs-popular-1 a";

    public Article(WebDriver driver) {
        this.driver = driver;
    }

    public Article goToFirstArticleInMostPopularRight() {
        driver.findElement(By.cssSelector(".right-most-popular-item__url")).click();
        return new Article(driver);
    }

    public String getFirstArticleInMostPopularRight() {
        return driver.findElement(By.cssSelector(".right-most-popular-item__url")).getAttribute("href");
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

    public String getFirstArticleInMostPopularBelow() {
        return driver.findElement(By.cssSelector(COMPONENT_POPULAR_BELOW)).getAttribute("href");
    }

    public boolean hasMostPopularBelow() {
        return driver.findElement(By.cssSelector(".article__popular")).isDisplayed();
    }

    public Article goToFirstArticleInMostPopularBottom() {
        driver.findElement(By.cssSelector(COMPONENT_POPULAR_BELOW)).click();
        return new Article(driver);
    }

    public boolean hasComments() {
        return driver.findElement(By.cssSelector(".discussion-content")).isDisplayed();
    }

    public boolean hasTweets() {
        return driver.findElement(By.cssSelector(".element-tweet")).isDisplayed();
    }
}


