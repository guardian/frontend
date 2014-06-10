package com.gu.fronts.integration.test.page.util;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.PageFactory;
import org.springframework.stereotype.Component;

@Component
public class PageFactoryHelper {

    /**
     * Simple wrapper of
     * {@link PageFactory#initElements(org.openqa.selenium.support.pagefactory.ElementLocatorFactory, Object)}
     */
    public <Page> Page loadPage(Class<Page> pageClass, WebDriver webDriver) {
        return PageFactory.initElements(webDriver, pageClass);
    }
}
