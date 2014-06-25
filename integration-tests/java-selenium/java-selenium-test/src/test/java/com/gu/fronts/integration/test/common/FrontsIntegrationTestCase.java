package com.gu.fronts.integration.test.common;

import static com.gu.fronts.integration.test.config.PropertyLoader.getProperty;

import org.junit.After;
import org.openqa.selenium.WebDriver;

import com.gu.fronts.integration.test.config.WebdriverFactory;
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage;
import com.gu.fronts.integration.test.page.util.CustomPageFactory;

/**
 * This is the super class of all integration test classes. It contains convenience method to get the start (network
 * front page)
 */
public class FrontsIntegrationTestCase {

    protected WebDriver webDriver = WebdriverFactory.getDefaultWebDriver();

    private String frontsBaseUrl = getProperty("fronts.base.url");

    protected CustomPageFactory pageFactoryHelper = new CustomPageFactory();

    protected NetworkFrontPage networkFrontPage;

    @After
    public void cleanSlate() {
        webDriver.manage().deleteAllCookies();
        webDriver.quit();
    }

    protected NetworkFrontPage openNetworkFrontPage() {
        webDriver.get(frontsBaseUrl);
        return networkFrontPage();
    }

    protected NetworkFrontPage networkFrontPage() {
        return pageFactoryHelper.initPage(webDriver, NetworkFrontPage.class);
    }
}
