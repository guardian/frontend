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
            testArticle = pageHelper
                    .goToArticle("/commentisfree/2014/jun/06/britain-fight-europe-beaches-d-day-eu-heroic-conflict");
    }

    @Test
    public void goToFirstLinkInSidebarPopular() throws Exception {
            String articleLink = testArticle.getFirstArticleInMostPopularRight();
        Article popularArticle = testArticle.goToFirstArticleInMostPopularRight();
        WaitHelper.waitForArticleLoad(driver);
            String articleURL = popularArticle.getCurrentURL();
            Assert.assertTrue("Article headline did not match the top link in Most Popular",
                    articleURL.contentEquals(articleLink));
    }

    @Test
    public void goToFirstLinkInRelatedContent() throws Exception {
            String articleLink = testArticle.getFirstRelatedArticleHref();
        Article relatedArticle = testArticle.goToFirstRelatedArticle();
            WaitHelper.waitForArticleLoad(driver);
            String articleURL = relatedArticle.getCurrentURL();
            Assert.assertTrue("Article headline did not match the top link in Related Content",
                    articleURL.contentEquals(articleLink));
    }

    @Test
    public void goToFirstLinkInBelowArticlePopular() throws Exception {
            String articleLink = testArticle.getFirstArticleInMostPopularBelow();
        Article popularBottomArticle = testArticle.goToFirstArticleInMostPopularBottom();
        WaitHelper.waitForArticleLoad(driver);
            String articleURL = popularBottomArticle.getCurrentURL();
            Assert.assertTrue("Article headline did not match the top link in Most Popular",
                    articleLink.contentEquals(articleURL));
    }

    @After
    public void tearDown() throws Exception {
        pageHelper.endTest();
    }
}
