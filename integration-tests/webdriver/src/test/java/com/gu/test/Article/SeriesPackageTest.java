package com.gu.test.Article;


import static com.gu.test.PropertyLoader.getProperty;
import static com.gu.test.WebDriverFactory.createWebDriver;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import com.gu.test.helpers.PageHelper;

public class SeriesPackageTest {
    WebDriver driver;
    private PageHelper pageHelper;
    private String seriesArticle = getProperty("articleWithSeries");

    @Before
    public void setUp() throws Exception {
        driver = createWebDriver();
        pageHelper = new PageHelper(driver);
        pageHelper.goToArticle(seriesArticle);
    }

    @Test
    public void articleHasSeriesHeader() throws Exception {
        String textLabel = driver.findElement(By.cssSelector(".content-meta__label")).getText();
        Assert.assertTrue("Failure: series header missing", textLabel.equals("Series"));
    }

    @Test
    public void articleHasSeriesComponent() throws Exception {
        Assert.assertTrue("Failure: Series component not found", driver.findElement(By.cssSelector(".container--series")).isDisplayed());
    }


    @After
    public void tearDown() throws Exception {
        pageHelper.endTest();
    }
}
