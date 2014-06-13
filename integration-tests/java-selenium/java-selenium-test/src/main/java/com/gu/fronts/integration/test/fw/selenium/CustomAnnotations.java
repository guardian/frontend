package com.gu.fronts.integration.test.fw.selenium;

import java.lang.reflect.Field;

import org.openqa.selenium.By;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.pagefactory.Annotations;

/**
 * Simple {@link Annotations} alternative implementation which supports a custom {@link By} implementation
 */
public class CustomAnnotations {

    private Field field;

    public CustomAnnotations(Field field) {
        this.field = field;
    }

    public boolean isLookupCached() {
        return (field.getAnnotation(CacheLookup.class) != null);
    }

    public By buildBy() {
        By ans = null;

        FindByTestAttribute findByTestAttr = field.getAnnotation(FindByTestAttribute.class);

        if (findByTestAttr != null) {
            ans = ByTestAttributeSelector.create(findByTestAttr.using());
        }

        if (ans == null) {
            throw new IllegalArgumentException("Cannot determine how to locate element " + field);
        }

        return ans;
    }
}
