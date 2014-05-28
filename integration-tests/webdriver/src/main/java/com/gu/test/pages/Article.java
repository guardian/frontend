package com.gu.test.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class Article {

    private WebDriver driver;

    public Article(WebDriver driver) {
        this.driver = driver;
    }


    public void shareViaEmail() {
        driver.findElement(By.cssSelector(".i-share-email")).click();
    }

    public void shareOnFacebook() {
        driver.findElement(By.cssSelector(".i-share-facebook")).click();
    }

    public void shareOnTwitter() {
        driver.findElement(By.cssSelector(".i-share-twitter")).click();
    }

    public void shareOnGooglePlus() {
        driver.findElement(By.cssSelector(".i-share-gplus")).click();
    }


    public boolean hasMostPopularRight() {

        return driver.findElement(By.cssSelector(".right-most-popular")).isDisplayed();
    }

    public Article goToFirstArticleInMostPopularRight() {
        driver.findElement(By.cssSelector(".right-most-popular-item__url")).click();
        return new Article(driver);
    }

    public String getFirstArticleInMostPopularRight() {
        return driver.findElement(By.cssSelector(".right-most-popular-item__url")).getText();
    }

    public String getArticleHeadline() {
        return driver.findElement(By.cssSelector(".content__headline")).getText();
    }

    public boolean hasRelatedContentContainer() {
        return driver.findElement(By.cssSelector(".related")).isDisplayed();
    }

    public String getFirstRelatedArticle() {
        return driver.findElement(By.cssSelector(".related .item__link")).getText();
    }

    public Article goToFirstRelatedArticle() {
        driver.findElement(By.cssSelector(".related .item__link")).click();
        return new Article(driver);
    }

    public String getFirstArticleInMostPopularBelow() {
        return driver.findElement(By.cssSelector(".article__popular div#tabs-popular-1 .headline-list__body")).getText();
    }

    public boolean hasMostPopularBelow() {
        return driver.findElement(By.cssSelector(".article__popular")).isDisplayed();
    }

    public Article goToFirstArticleInMostPopularBottom() {
        driver.findElement(By.cssSelector(".article__popular div#tabs-popular-1 a")).click();
        return new Article(driver);
    }

    public boolean hasComments() {
        return driver.findElement(By.cssSelector(".discussion-content")).isDisplayed();
    }

    public boolean hasTweets() {
        return driver.findElement(By.cssSelector(".element-tweet")).isDisplayed();
    }
}


