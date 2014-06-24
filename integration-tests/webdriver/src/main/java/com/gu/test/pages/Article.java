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

    public Article(WebDriver driver) {
        this.driver = driver;
    }

    public String getCurrentURL() {
        return driver.getCurrentUrl();
    }

    public void shareViaEmail() {
        driver.findElement(By.cssSelector(".i-share-email")).click();
        WaitHelper.waitForPageLoad(driver);
    }

    public void shareOnFacebook() {
        driver.findElement(By.cssSelector(".i-share-facebook")).click();
        WaitHelper.waitForPageLoad(driver);
    }

    public void shareOnTwitter() {
        driver.findElement(By.cssSelector(".i-share-twitter")).click();
        WaitHelper.waitForPageLoad(driver);
    }

    public void shareOnGooglePlus() {
        driver.findElement(By.cssSelector(".i-share-gplus")).click();
        WaitHelper.waitForPageLoad(driver);
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
        return driver.findElement(By.cssSelector(".discussion-content")).isDisplayed();
    }

    public boolean hasTweets() {
        return driver.findElement(By.cssSelector(".element-tweet")).isDisplayed();
    }
}


