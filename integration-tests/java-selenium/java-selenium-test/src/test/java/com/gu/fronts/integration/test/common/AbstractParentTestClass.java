package com.gu.fronts.integration.test.common;

import org.junit.BeforeClass;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.PageFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import com.gu.fronts.integration.EnvironmentConfigurer;
import com.gu.fronts.integration.test.page.NetworkFrontPage;

public class AbstractParentTestClass {

    @Autowired
    private WebDriver webDriver;
    @Value("${fronts.base.url}")
    private String frontsBaseUrl;
    
    @BeforeClass
    public static void testClassSetup() {
        EnvironmentConfigurer.setupEnvironmentProperty();
    }
    
    protected NetworkFrontPage networkFrontPage(){
        webDriver.get(frontsBaseUrl);
        return loadPage(NetworkFrontPage.class);
    }
    
    protected <Page>Page loadPage(Class<Page> pageClass) {
        return (Page)PageFactory.initElements(webDriver, pageClass);
    }
}
