package com.gu.test.helpers;

import com.gu.test.Config;
import com.gu.test.pages.Article;
import com.gu.test.pages.FrontPage;
import com.gu.test.pages.LiveBlog;
import org.openqa.selenium.WebDriver;

public class PageHelper {
    private WebDriver driver;

    protected final String BASE_URL = new Config().getBaseUrl();
    protected final String TEST_CARD = new Config().getTestCard();
    protected final String liveSite = "http://www.theguardian.com/uk?view=mobile";

    public PageHelper(WebDriver driver) {
        this.driver = driver;
    }

    public Object getBaseUrl() {
        return BASE_URL;
    }

    public FrontPage goToFronts() {
        String frontPageURL = BASE_URL + TEST_CARD;
        driver.get(frontPageURL);
        return new FrontPage(driver);
    }

    public Article goToArticle(String article) {
        driver.get(BASE_URL + article);
        WaitHelper.waitForPageLoad(driver);
        return new Article(driver);
    }

    public LiveBlog goToLiveBlog(String blog) {
        driver.get(BASE_URL + blog);
        WaitHelper.waitForPageLoad(driver);
        return new LiveBlog(driver);
    }

    public FrontPage goToFrontsForTracking() {
        driver.get(liveSite);
        return new FrontPage(driver);
    }

    public void endTest() {
        if (driver != null) {
            driver.close();
            driver.quit();
        }
    }
}
