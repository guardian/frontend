package com.gu.test.Article;

import com.gu.test.Config;
import com.gu.test.helpers.PageHelper;
import com.gu.test.pages.LiveBlog;
import org.junit.*;
import org.openqa.selenium.WebDriver;

import static com.gu.test.WebDriverFactory.createWebDriver;

public class LiveBlogTest {
    WebDriver driver;
    private PageHelper pageHelper;
    private LiveBlog testBlog;
    private String ARTICLE_WITH_LIVEBLOG = new Config().getArticleLiveBlog();

    @Before
    public void setUp() throws Exception {
        driver = createWebDriver();
        pageHelper = new PageHelper(driver);
        testBlog = pageHelper.goToLiveBlog(ARTICLE_WITH_LIVEBLOG);
    }

    @Test
    public void blogHasTruncation() {
        Assert.assertTrue("Failure: Truncated Block is displayed ", testBlog.hasTruncation());
    }

    @Test
    public void blogViewAllUpdates() {
        testBlog.viewAllUpdates();
        Assert.assertFalse("Failure: Truncated Block is still hidden ", testBlog.hasTruncation());
    }

    @After
    public void tearDown() throws Exception {
        pageHelper.endTest();
    }
}
