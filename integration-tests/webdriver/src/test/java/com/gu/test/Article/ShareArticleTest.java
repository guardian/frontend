package com.gu.test.Article;

import com.gu.test.helpers.PageHelper;
import com.gu.test.pages.Article;
import org.junit.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import static com.gu.test.WebDriverFactory.createWebDriver;

public class ShareArticleTest {
    WebDriver driver;
    private PageHelper pageHelper;
    private Article testArticle;

    @Before
    public void setUp() throws Exception {
        driver = createWebDriver();
        pageHelper = new PageHelper(driver);
        testArticle = pageHelper.goToArticle("/commentisfree/2014/may/30/an-open-letter-to-all-my-male-friends");
    }

    @Ignore //to do
    @Test
    public void shareViaEmail() throws Exception {
        testArticle.shareViaEmail();
        //assert that it clicks through to something, tricky one this.
    }


    @Test
    public void shareViaFacebook() throws Exception {
        testArticle.shareOnFacebook();
        Assert.assertTrue(driver.findElement(By.cssSelector(".fb_content")).isDisplayed());
    }

    @Test
    public void shareViaTwitter() throws Exception {
        testArticle.shareOnTwitter();
        Assert.assertTrue(driver.findElement(By.cssSelector(".tfw")).isDisplayed());
    }

    @Test
    public void shareOnGooglePlus() throws Exception {
        testArticle.shareOnGooglePlus();
        Assert.assertTrue(driver.findElement(By.cssSelector(".google-header-bar")).isDisplayed());
    }

    @After
    public void tearDown() throws Exception {
        pageHelper.endTest();
    }
}
