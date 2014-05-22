package com.gu.test.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;

public class Article {

    private WebDriver driver;

    public Article(WebDriver driver) {
        this.driver = driver;
    }


    public void shareViaEmail(){
        driver.findElement(By.cssSelector(".i-share-email")).click();
    }

    public void shareOnFacebook(){
        driver.findElement(By.cssSelector("i-share-facebook")).click();
            }

    public void shareOnTwitter(){
        driver.findElement(By.cssSelector("i-share-twitter i")).click();
    }

    public void shareOnGooglePlus(){
        driver.findElement(By.cssSelector("i-share-gplus i")).click();
    }


    public boolean hasMostPopularRight() {

        return driver.findElement(By.cssSelector(".right-most-popular")).isDisplayed();
    }

    public Article goToFirstArticleInMostPopularRight(){

        driver.findElement(By.cssSelector(".right-most-popular-item")).click();
        return new Article(driver);
    }


    public String getArticleHeadline(){
        return driver.findElement(By.cssSelector(".article__headline")).getText();
    }
}
