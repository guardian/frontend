package com.gu.test.pages;

import com.gu.test.helpers.WaitHelper;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;

public class Article {

    private WebDriver driver;
    private static final String COMPONENT_POPULAR_BELOW = ".article__popular div#tabs-popular-1 a";
    private static final String COMPONENT_POPULAR_RIGHT = ".right-most-popular-item__url";
    private static final String COMPONENT_RELATED_CONTENT = ".related .item__link";
    private static final String TWEET = ".element-tweet .twitter-tweet";
    private static final String COMMENTS = ".discussion-content";

    public Article(WebDriver driver) {
        this.driver = driver;
    }

    public String getCurrentURL() {
        return driver.getCurrentUrl();
    }

    public boolean hasMostPopularRight() {
        return driver.findElement(By.cssSelector(COMPONENT_POPULAR_RIGHT)).isDisplayed();
    }

    public Article goToFirstArticleInMostPopularRight() {
        driver.findElement(By.cssSelector(COMPONENT_POPULAR_RIGHT)).click();
        return new Article(driver);
    }

    public String getFirstArticleInMostPopularRight() {
        return driver.findElement(By.cssSelector(COMPONENT_POPULAR_RIGHT)).getAttribute("href");
    }


    public boolean hasRelatedContentContainer() throws NoSuchElementException {
        return driver.findElement(By.cssSelector(COMPONENT_RELATED_CONTENT)).isDisplayed();
    }

    public String getFirstRelatedArticle() {
        return driver.findElement(By.cssSelector(COMPONENT_RELATED_CONTENT)).getAttribute("href");
    }

    public Article goToFirstRelatedArticle() {
        driver.findElement(By.cssSelector(COMPONENT_RELATED_CONTENT)).click();
        return new Article(driver);
    }

    public String getFirstArticleInMostPopularBelow() {
        return driver.findElement(By.cssSelector(COMPONENT_POPULAR_BELOW)).getAttribute("href");
    }

    public boolean hasMostPopularBelow() throws NoSuchElementException {
        return driver.findElement(By.cssSelector(COMPONENT_POPULAR_BELOW)).isDisplayed();
    }

    public Article goToFirstArticleInMostPopularBottom() {
        driver.findElement(By.cssSelector(COMPONENT_POPULAR_BELOW)).click();
        WaitHelper.waitForPageLoad(driver);
        return new Article(driver);
    }

    public boolean hasComments() {
        return driver.findElement(By.cssSelector(COMMENTS)).isDisplayed();
    }

    public boolean hasTweets() {
        return driver.findElement(By.cssSelector(TWEET)).isDisplayed();
    }
}


