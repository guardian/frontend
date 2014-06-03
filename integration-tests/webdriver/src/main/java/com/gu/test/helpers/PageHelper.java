package com.gu.test.helpers;

import com.gu.test.pages.Article;
import com.gu.test.pages.FrontPage;
import com.gu.test.pages.LiveBlog;
import org.openqa.selenium.WebDriver;

public class PageHelper {
    private WebDriver driver;
    protected final String baseUrl = "http://m.code.dev-theguardian.com";
    protected final String betaSite = "/testcard";
    protected final String adsOff = "#gu.prefs.switchOff=adverts";

    public PageHelper(WebDriver driver) {
        this.driver = driver;
    }

    public Object getBaseUrl() {
        return this.baseUrl;
    }

    public FrontPage goToFronts() {
        String frontPageURL = this.getBaseUrl() + betaSite + adsOff;
        driver.get(frontPageURL);
        return new FrontPage(driver);
    }

    public Article goToArticle(String article){
        driver.get(this.baseUrl + article + adsOff);
        WaitHelper.waitForArticleLoad(driver);
        return new Article(driver);
    }

    public LiveBlog goToLiveBlog(String blog) {
        driver.get(this.baseUrl + blog);
        WaitHelper.waitForArticleLoad(driver);
        return new LiveBlog(driver);
    }

    public FrontPage goToFrontsForTracking() {
        String frontPageURL = "http://www.theguardian.com/uk?view=mobile" + adsOff;
        driver.get(frontPageURL);
        return new FrontPage(driver);
    }

    public void endTest() {
        if (driver != null) {
            driver.close();
            driver.quit();
        }
    }
}
