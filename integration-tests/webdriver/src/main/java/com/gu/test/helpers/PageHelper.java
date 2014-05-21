package com.gu.test.helpers;

import com.gu.test.pages.FrontPage;
import org.openqa.selenium.WebDriver;

public class PageHelper {
    private WebDriver driver;
    protected final String baseUrl = "http://m.code.dev-theguardian.com";
    protected final String betaSite = "/testcard";

    public PageHelper(WebDriver driver) {
        this.driver = driver;
    }

    public Object getBaseUrl() {
        return this.baseUrl;
    }

    public FrontPage goToFronts() {
        String frontPageURL = this.getBaseUrl() + betaSite;
        driver.get(frontPageURL);
        return new FrontPage(driver);
    }

    public FrontPage goToFrontsForTracking() {
        String frontPageURL = "http://www.theguardian.com/uk?view=mobile";
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
