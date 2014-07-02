package com.gu.test.Article;

import static com.gu.test.PropertyLoader.getProperty;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import com.gu.test.SeleniumTestCase;
import com.gu.test.pages.Article;

public class ArticleCommentTest extends SeleniumTestCase {
    private Article testArticle;
    private String ARTICLE_WITH_COMMENTS = getProperty("articleWithComments");

    @Before
    public void setUp() throws Exception {
        super.setUp();
        testArticle = pageHelper.goToArticle(ARTICLE_WITH_COMMENTS);
    }

    @Test
    public void articleHasComments() {
        Assert.assertTrue("Failure: Comments missing from page", testArticle.hasComments());
    }
}
