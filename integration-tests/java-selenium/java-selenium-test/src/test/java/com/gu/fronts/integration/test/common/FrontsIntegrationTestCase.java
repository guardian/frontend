package com.gu.fronts.integration.test.common;

import org.junit.BeforeClass;
import org.openqa.selenium.WebDriver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import com.gu.fronts.integration.test.config.EnvironmentConfigurer;
import com.gu.fronts.integration.test.page.NetworkFrontPage;
import com.gu.fronts.integration.test.page.util.CustomPageFactory;

/**
 * This is the super class of all integration test classes. It contains convenience method to get the start (network
 * front page)
 */
public class FrontsIntegrationTestCase {

    @Autowired
    protected WebDriver webDriver;
    @Value("${fronts.base.url}")
    private String frontsBaseUrl;
    @Autowired
    protected CustomPageFactory pageFactoryHelper;

    @BeforeClass
    public static void testClassSetup() {
        EnvironmentConfigurer.setupEnvironmentProperty();
    }

    protected NetworkFrontPage openNetworkFrontPage() {
        webDriver.get(frontsBaseUrl);
        return pageFactoryHelper.initPage(webDriver, NetworkFrontPage.class);
    }
}
