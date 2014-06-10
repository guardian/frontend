package com.gu.fronts.integration.test.common.page;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.PageFactory;
import org.springframework.stereotype.Component;

@Component
public class PageFactoryHelper {

    /**
     * Simple wrapper of
     * {@link PageFactory#initElements(org.openqa.selenium.support.pagefactory.ElementLocatorFactory, Object)} which
     * cast the initialized page to the proper class
     */
    public <Page> Page loadPage(Class<Page> pageClass, WebDriver webDriver) {
        return (Page) PageFactory.initElements(webDriver, pageClass);
    }
}
