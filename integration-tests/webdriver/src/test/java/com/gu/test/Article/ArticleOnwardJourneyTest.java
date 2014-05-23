package com.gu.test.Article;

import com.gu.test.helpers.PageHelper;
import com.gu.test.helpers.WaitHelper;
import com.gu.test.pages.Article;
import com.gu.test.shared.NavigationBar;
import org.junit.Assert;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import static com.gu.test.WebDriverFactory.createWebDriver;

public class ArticleOnwardJourneyTest {
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
    public void goToFirstLinkInSidebarPopular() throws Exception {
        Assert.assertTrue("Failure: Most Popular In Right Hand Bar is Missing", testArticle.hasMostPopularRight());
        String linkText = testArticle.getFirstArticleInMostPopularRight();
        Article popularArticle = testArticle.goToFirstArticleInMostPopularRight();
        WaitHelper.waitForArticleLoad(driver);
        String popularH1 = popularArticle.getArticleHeadline();
        Assert.assertTrue("Article headline did not match the top link in Most Popular", linkText.contentEquals(popularH1));
    }

    @Test
    public void goToFirstLinkInRelatedContent() throws Exception {
        Assert.assertTrue("Failure: Related content container missing", testArticle.hasRelatedContentContainer());
        String linkText = testArticle.getFirstRelatedArticle();
        System.out.println(linkText);
        Article relatedArticle = testArticle.goToFirstRelatedArticle();
        WaitHelper.waitForArticleLoad(driver);
        String relatedH1 = relatedArticle.getArticleHeadline();
        Assert.assertTrue("Article headline did not match the top link in Related Content", linkText.contentEquals(relatedH1));
    }

    @Test
    public void goToFirstLinkInBelowArticlePopular() throws Exception {
        Assert.assertTrue("Failure: Most Popular In Bottom Hand Bar is Missing", testArticle.hasMostPopularBelow());
        String linkText = testArticle.getFirstArticleInMostPopularBelow();
        Article popularBottomArticle = testArticle.goToFirstArticleInMostPopularBottom();
        WaitHelper.waitForArticleLoad(driver);
        String popularH1 = popularBottomArticle.getArticleHeadline();
        Assert.assertTrue("Article headline did not match the top link in Most Popular", linkText.contentEquals(popularH1));
    }


    @After
    public void tearDown() throws Exception {
        pageHelper.endTest();
    }
}
