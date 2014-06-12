package com.gu.fronts.integration.test.fw;

import java.lang.reflect.Field;

import org.openqa.selenium.SearchContext;
import org.openqa.selenium.support.pagefactory.DefaultElementLocator;
import org.openqa.selenium.support.pagefactory.ElementLocator;
import org.openqa.selenium.support.pagefactory.ElementLocatorFactory;

public class CustomElementLocatorFactory implements ElementLocatorFactory {

    private final SearchContext searchContext;

    public CustomElementLocatorFactory(SearchContext searchContext) {
        this.searchContext = searchContext;
    }

    @Override
    public ElementLocator createLocator(Field field) {
        if (field.isAnnotationPresent(FindByTestAttribute.class)) {
            return new CustomTestAttributeElementLocator(searchContext, field);
        } else {
            return new DefaultElementLocator(searchContext, field);
        }
    }

}
