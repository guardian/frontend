package com.gu.fronts.integration.test.page.util;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.pagefactory.ElementLocatorFactory;

import com.gu.fronts.integration.test.fw.CustomElementLocatorFactory;

public class CustomPageFactory {

    /**
     * Wraps {@link PageFactory#initElements(ElementLocatorFactory, Object)} and provides a custom
     * {@link ElementLocatorFactory}
     */
    public <Page> Page initPage(WebDriver webDriver, Class<Page> pageClass) {
        Page page = instantiatePage(webDriver, pageClass);
        PageFactory.initElements(new CustomElementLocatorFactory(webDriver), page);
        return page;
    }

    private static <T> T instantiatePage(WebDriver driver, Class<T> pageClassToProxy) {
        try {
            try {
                Constructor<T> constructor = pageClassToProxy.getConstructor(WebDriver.class);
                return constructor.newInstance(driver);
            } catch (NoSuchMethodException e) {
                return pageClassToProxy.newInstance();
            }
        } catch (InstantiationException e) {
            throw new RuntimeException(e);
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        } catch (InvocationTargetException e) {
            throw new RuntimeException(e);
        }
    }
}
