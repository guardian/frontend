package com.gu.test.Article;

import com.gu.test.helpers.PageHelper;
import com.gu.test.pages.Article;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
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
        testArticle = pageHelper.goToArticle("/film/filmblog/2014/may/20/lost-river-reviews-cannes-scorn-ryan-gosling");
    }


    @Test
    public void shareViaEmail() throws Exception {
        testArticle.shareViaEmail();
        //assert that it clicks through to something, tricky one this.

    }

    @Test
    public void shareViaFacebook() throws Exception {
        testArticle.shareOnFacebook();
    }

    @Test
    public void shareViaTwitter() throws Exception {
        testArticle.shareOnTwitter();
    }

    @Test
    public void shareOnGooglePlus() throws Exception {
        testArticle.shareOnGooglePlus();
    }


    @After
    public void tearDown() throws Exception {
        pageHelper.endTest();
    }
}
