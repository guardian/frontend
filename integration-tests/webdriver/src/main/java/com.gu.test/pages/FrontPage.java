package com.gu.test.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;
import java.util.Random;

public class FrontPage {
    private WebDriver driver;
    private String dataComponent;

    public FrontPage(WebDriver driver) {
        this.driver = driver;

    }

    public WebElement expandSection() {
        WebElement section = driver.findElement(By.cssSelector("button.collection__show-more"));
        WebElement parent = section.findElement(By.xpath(".."));
        section.click();
        return parent;
    }


    public Article goToFirstArticle() {
        driver.findElement(By.xpath("/descendant::a[@data-link-name=\"article\"][1]")).click();
        return new Article(driver);

    }


    public Article goToArticleInTopStories() {
        driver.findElement(By.xpath("/descendant::section[@data-component=\"top-stories\"]//a[@data-link-name=\"article\"][1]")).click();
        return new Article(driver);
    }

    public Article goToArticleInSportContainer() {
        driver.findElement(By.xpath("/descendant::section[@data-component=\"sport\"]//a[@data-link-name=\"article\"][1]")).click();
        return new Article(driver);
    }


}
