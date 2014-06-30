package com.gu.fronts.integration.test.fw.selenium;

import java.lang.reflect.Field;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.pagefactory.Annotations;
import org.openqa.selenium.support.pagefactory.DefaultElementLocator;
import org.openqa.selenium.support.pagefactory.ElementLocator;

/**
 * Custom Element Locator which allows me to use a Custom {@link Annotations} implementation. It is basically a copy of
 * {@link DefaultElementLocator} because that one is implemented in a way which does not allow you to override the
 * Annotations implementation, so I couldn't inherit and override that.
 */
public class CustomTestAttributeElementLocator implements ElementLocator {
    private final SearchContext searchContext;
    private final boolean shouldCache;
    private final By by;
    private WebElement cachedElement;
    private List<WebElement> cachedElementList;

    public CustomTestAttributeElementLocator(SearchContext searchContext, Field field) {
        this.searchContext = searchContext;
        CustomAnnotations annotations = new CustomAnnotations(field);
        shouldCache = annotations.isLookupCached();
        by = annotations.buildBy();
    }

    public WebElement findElement() {
        if (cachedElement != null && shouldCache) {
            return cachedElement;
        }

        WebElement element = searchContext.findElement(by);
        if (shouldCache) {
            cachedElement = element;
        }

        return element;
    }

    public List<WebElement> findElements() {
        if (cachedElementList != null && shouldCache) {
            return cachedElementList;
        }

        List<WebElement> elements = searchContext.findElements(by);
        if (shouldCache) {
            cachedElementList = elements;
        }

        return elements;
    }

}
