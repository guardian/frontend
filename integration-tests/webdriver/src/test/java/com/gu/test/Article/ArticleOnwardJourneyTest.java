package com.gu.test.Article;

import com.gu.test.helpers.PageHelper;
import com.gu.test.helpers.WaitHelper;
import com.gu.test.pages.Article;
import org.junit.*;
import org.openqa.selenium.WebDriver;

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
        String linkText = testArticle.getFirstArticleInMostPopularRight();
        Article popularArticle = testArticle.goToFirstArticleInMostPopularRight();
        WaitHelper.waitForArticleLoad(driver);
        String popularH1 = popularArticle.getArticleHeadline();
        Assert.assertTrue("Article headline did not match the top link in Most Popular", linkText.contentEquals(popularH1));
    }

    @Test
    public void goToFirstLinkInRelatedContent() throws Exception {
        String linkText = testArticle.getFirstRelatedArticle();
        Article relatedArticle = testArticle.goToFirstRelatedArticle();
        WaitHelper.waitForArticleLoad(driver);
        String relatedH1 = relatedArticle.getArticleHeadline();
        Assert.assertTrue("Article headline did not match the top link in Related Content", linkText.contentEquals(relatedH1));
    }

    @Test
    public void goToFirstLinkInBelowArticlePopular() throws Exception {
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
