package com.gu.test.Article;

import static com.gu.test.PropertyLoader.getProperty;
import static com.gu.test.WebDriverFactory.createWebDriver;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriver;

import com.gu.test.helpers.PageHelper;
import com.gu.test.helpers.WaitHelper;
import com.gu.test.pages.Article;

public class ArticleOnwardJourneyTest {
    WebDriver driver;
    private PageHelper pageHelper;
    private Article testArticle;
    private String ARTICLE_WITH_SERIES = getProperty("articleWithSeries");

    @Before
    public void setUp() throws Exception {
        driver = createWebDriver();
        pageHelper = new PageHelper(driver);
        testArticle = pageHelper.goToArticle(ARTICLE_WITH_SERIES);
    }

    @Test
    public void goToFirstLinkInSidebarPopular() throws Exception {
        String articleLink = testArticle.getFirstArticleInMostPopularRight();
        Article popularArticle = testArticle.goToFirstArticleInMostPopularRight();
        WaitHelper.waitForPageLoad(driver);
        String popularArticleCurrentURL = popularArticle.getCurrentURL();
        Assert.assertTrue("Article URL did not match the top link in Most Popular", articleLink.contentEquals(popularArticleCurrentURL));
    }

    @Test
    public void goToFirstLinkInRelatedContent() throws Exception {
        String articleLink = testArticle.getFirstRelatedArticle();
        Article relatedArticle = testArticle.goToFirstRelatedArticle();
        WaitHelper.waitForPageLoad(driver);
        String relatedArticleCurrentURL = relatedArticle.getCurrentURL();
        Assert.assertTrue("Article URL did not match the top link in Related Content", articleLink.contentEquals(relatedArticleCurrentURL));
    }

    @Test
    public void goToFirstLinkInBelowArticlePopular() throws Exception {
        String articleLink = testArticle.getFirstArticleInMostPopularBelow();
        Article popularBottomArticle = testArticle.goToFirstArticleInMostPopularBottom();
        WaitHelper.waitForPageLoad(driver);
        String popularArticleCurrentURL = popularBottomArticle.getCurrentURL();
        Assert.assertTrue("Article headline did not match the top link in Most Popular", articleLink.contentEquals(popularArticleCurrentURL));
    }


    @After
    public void tearDown() throws Exception {
        pageHelper.endTest();
    }
}
