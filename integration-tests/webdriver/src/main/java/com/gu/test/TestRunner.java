package com.gu.test;

import com.gu.test.pages.FrontPage;
import org.openqa.selenium.WebDriver;

public class TestRunner {
    private WebDriver driver;
    protected final String baseUrl = "http://m.code.dev-theguardian.com";
    protected final String betaSite = "/testcard";

    public TestRunner(WebDriver driver) {
        this.driver = driver;

    }

    public Object getBaseUrl() {
        return this.baseUrl;
    }

    public FrontPage goToFronts(WebDriver driver) {
        String frontPageURL = this.getBaseUrl() + betaSite;
        driver.get(frontPageURL);
        return new FrontPage(driver);
    }

    public FrontPage goToFrontsForTracking(WebDriver driver) {
        String frontPageURL = this.getBaseUrl() + "/uk?view=mobile";
        driver.get(frontPageURL);
        return new FrontPage(driver);
    }

    public void endTest(WebDriver driver) {
        if (driver != null) {
            driver.close();
            driver.quit();
        }
    }


}
