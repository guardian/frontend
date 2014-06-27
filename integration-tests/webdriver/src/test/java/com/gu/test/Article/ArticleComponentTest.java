package com.gu.test.Article;

import static com.gu.test.PropertyLoader.getProperty;
import static com.gu.test.WebDriverFactory.createWebDriver;

import com.gu.test.RetryRule;
import org.junit.*;
import org.openqa.selenium.WebDriver;

import com.gu.test.helpers.PageHelper;
import com.gu.test.pages.Article;

public class ArticleComponentTest {
    WebDriver driver;
    private PageHelper pageHelper;
    private Article testArticle;
    private String ARTICLE_WITH_TWEETS = getProperty("articleWithTweets");

    @Rule
    public RetryRule retry = new RetryRule(2);

    @Before
    public void setUp() throws Exception {
        driver = createWebDriver();
        pageHelper = new PageHelper(driver);
        testArticle = pageHelper.goToArticle(ARTICLE_WITH_TWEETS);
    }


    @Test
    public void articleHasMostPopularSidebar() {
        Assert.assertTrue("Failure: Related content container missing", testArticle.hasMostPopularRight());
    }

    @Test
    public void articleHasPopularContainerBelow() {
        Assert.assertTrue("Failure: Most Popular In Bottom Hand Bar is Missing", testArticle.hasMostPopularBelow());
    }

    @Test
    public void articleHasRelatedContentContainer() {
        Assert.assertTrue("Failure: Related content container missing", testArticle.hasRelatedContentContainer());
    }

    @Test
    public void articleHasTweets() {
        Assert.assertTrue("Failure: Tweets missing from page", testArticle.hasTweets());
    }

    @After
    public void tearDown() throws Exception {
        pageHelper.endTest();
    }
}
