package com.gu.test.Article;

import static com.gu.test.PropertyLoader.getProperty;
import static com.gu.test.WebDriverFactory.createWebDriver;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriver;

import com.gu.test.helpers.PageHelper;
import com.gu.test.pages.Article;

public class ArticleCommentTest {
    WebDriver driver;
    private PageHelper pageHelper;
    private Article testArticle;
    private String ARTICLE_WITH_COMMENTS = getProperty("articleWithComments");

    @Before
    public void setUp() throws Exception {
        driver = createWebDriver();
        pageHelper = new PageHelper(driver);
        testArticle = pageHelper.goToArticle(ARTICLE_WITH_COMMENTS);
    }

    @Test
    public void articleHasComments() {
        Assert.assertTrue("Failure: Comments missing from page", testArticle.hasComments());
    }

    @After
    public void tearDown() throws Exception {
        pageHelper.endTest();
    }
}
