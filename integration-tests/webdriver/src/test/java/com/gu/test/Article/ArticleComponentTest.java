package com.gu.test.Article;

import com.gu.test.helpers.PageHelper;
import com.gu.test.pages.Article;
import org.junit.*;
import org.openqa.selenium.WebDriver;

import static com.gu.test.WebDriverFactory.createWebDriver;

public class ArticleComponentTest {
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
