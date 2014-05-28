package com.gu.test.Article;


import com.gu.test.helpers.PageHelper;
import com.gu.test.pages.Article;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriver;

import static com.gu.test.WebDriverFactory.createWebDriver;

public class StoryPackageTest {
    WebDriver driver;
    private PageHelper pageHelper;
    private Article testArticle;

    @Before
    public void setUp() throws Exception {
        driver = createWebDriver();
        pageHelper = new PageHelper(driver);
        testArticle = pageHelper.goToArticle("/lifeandstyle/womens-blog/2014/may/16/too-many-women-touched-grabbed-groped-without-consent");
    }

    @Test
    public void articleHasStoryPackageTest() throws Exception {
        
    }


    @After
    public void tearDown() throws Exception {
        pageHelper.endTest();
    }
}
