package com.gu.test.Article;


import com.gu.test.helpers.PageHelper;
import com.gu.test.pages.Article;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import static com.gu.test.WebDriverFactory.createWebDriver;

public class SeriesPackageTest {
    WebDriver driver;
    private PageHelper pageHelper;

    @Before
    public void setUp() throws Exception {
        driver = createWebDriver();
        pageHelper = new PageHelper(driver);
        pageHelper.goToArticle("/lifeandstyle/womens-blog/2014/may/16/too-many-women-touched-grabbed-groped-without-consent");
    }

    @Test
    public void articleHasSeriesHeader() throws Exception {
        String textLabel = driver.findElement(By.cssSelector(".content-meta__label")).getText();
        Assert.assertTrue("Failure: series header missing", textLabel.equals("Series"));
    }

    @Test
    public void articleHasSeriesComponent() throws Exception{
        Assert.assertTrue("Failure: Series component not found",driver.findElement(By.cssSelector(".")).isDisplayed());
    }


    @After
    public void tearDown() throws Exception {
        pageHelper.endTest();
    }
}
