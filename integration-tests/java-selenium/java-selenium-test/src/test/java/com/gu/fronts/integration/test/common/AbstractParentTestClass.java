package com.gu.fronts.integration.test.common;

import org.junit.BeforeClass;
import org.openqa.selenium.WebDriver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import com.gu.fronts.integration.test.EnvironmentConfigurer;
import com.gu.fronts.integration.test.common.page.PageFactoryHelper;
import com.gu.fronts.integration.test.page.NetworkFrontPage;

public class AbstractParentTestClass {

    @Autowired
    private WebDriver webDriver;
    @Value("${fronts.base.url}")
    private String frontsBaseUrl;
    @Autowired
    protected PageFactoryHelper pageFactoryHelper;

    @BeforeClass
    public static void testClassSetup() {
        EnvironmentConfigurer.setupEnvironmentProperty();
    }

    protected NetworkFrontPage openNetworkFrontPage() {
        webDriver.get(frontsBaseUrl);
        return pageFactoryHelper.loadPage(NetworkFrontPage.class, webDriver);
    }
}
