package com.gu.fronts.integration.test.common;

import org.junit.After;
import org.junit.BeforeClass;
import org.openqa.selenium.WebDriver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import com.gu.fronts.integration.test.config.EnvironmentConfigurer;
import com.gu.fronts.integration.test.page.NetworkFrontPage;
import com.gu.fronts.integration.test.page.util.PageFactoryHelper;

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
    
    @After
    public void afterTestCase(){
        webDriver.manage().deleteAllCookies();
    }

    protected NetworkFrontPage openNetworkFrontPage() {
        webDriver.get(frontsBaseUrl);
        return pageFactoryHelper.loadPage(NetworkFrontPage.class, webDriver);
    }
}
