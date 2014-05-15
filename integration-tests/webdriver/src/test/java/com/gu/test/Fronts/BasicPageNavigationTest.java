package com.gu.test.Fronts;

import com.gu.test.pages.Article;
import com.gu.test.pages.FrontPage;
import com.gu.test.TestRunner;
import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import java.util.concurrent.TimeUnit;

public class BasicPageNavigationTest {
    WebDriver driver;
    private TestRunner testRunner;
    private FrontPage fronts;
    private Article article;

    @Before
    public void setUp() throws Exception {
        driver = new FirefoxDriver();
        driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
        testRunner = new TestRunner(driver);
        fronts = testRunner.goToFronts(driver);
    }
    @Ignore
    @Test
    public void openTheFirstArticleOnUKFronts() throws Exception {
        fronts.goToFirstArticle();
    }

    @Test
    public void expandSection() throws Exception{
        WebElement parent = fronts.expandSection();
        System.out.println(parent);
    }


    @After
    public void tearDown() throws Exception {
        testRunner.endTest(driver);
    }
}

