package com.gu.test.Article;

import static com.gu.test.PropertyLoader.getProperty;
import com.gu.test.SeleniumTestCase;
import com.gu.test.helpers.RetryRule;
import org.junit.*;

import com.gu.test.pages.Article;

public class ArticleOnwardJourneyTest extends SeleniumTestCase {
    private Article testArticle;
    private String ARTICLE_WITH_SERIES = getProperty("articleWithSeries");

    @Rule
    public RetryRule retry = new RetryRule(2);

    @Before
    public void setUp() throws Exception {
        super.setUp();
        testArticle = pageHelper.goToArticle(ARTICLE_WITH_SERIES);
    }

    @Test
    public void goToFirstLinkInSidebarPopular() throws Exception {
        String articleLink = testArticle.getFirstArticleInMostPopularRight();
        Article popularArticle = testArticle.goToFirstArticleInMostPopularRight();
        String popularArticleCurrentURL = popularArticle.getCurrentURL();
        Assert.assertTrue("Article URL did not match the top link in Most Popular", articleLink.contentEquals(popularArticleCurrentURL));
    }

    @Test
    public void goToFirstLinkInRelatedContent() throws Exception {
        String articleLink = testArticle.getFirstRelatedArticle();
        Article relatedArticle = testArticle.goToFirstRelatedArticle();
        String relatedArticleCurrentURL = relatedArticle.getCurrentURL();
        Assert.assertTrue("Article URL did not match the top link in Related Content", articleLink.contentEquals(relatedArticleCurrentURL));
    }

    @Test
    public void goToFirstLinkInBelowArticlePopular() throws Exception {
        String articleLink = testArticle.getFirstArticleInMostPopularBelow();
        Article popularBottomArticle = testArticle.goToFirstArticleInMostPopularBottom();
        String popularArticleCurrentURL = popularBottomArticle.getCurrentURL();
        Assert.assertTrue("Article headline did not match the top link in Most Popular", articleLink.contentEquals(popularArticleCurrentURL));
    }
}
