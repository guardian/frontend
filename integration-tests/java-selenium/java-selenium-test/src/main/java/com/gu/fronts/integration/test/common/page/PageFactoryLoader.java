package com.gu.fronts.integration.test.common.page;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.PageFactory;

public class PageFactoryLoader {

    public static <Page> Page loadPage(Class<Page> pageClass, WebDriver webDriver) {
        return (Page) PageFactory.initElements(webDriver, pageClass);
    }
}
