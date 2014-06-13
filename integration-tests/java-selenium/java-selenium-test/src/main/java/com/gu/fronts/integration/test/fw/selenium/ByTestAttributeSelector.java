package com.gu.fronts.integration.test.fw.selenium;

import org.apache.commons.lang3.StringUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.By.ByCssSelector;

/**
 * Custom {@link By} implementation which matches a provided string value to an attribute of name
 * {@link ByTestAttributeSelector#TEST_ATTR_NAME} by using {@link ByCssSelector}
 */
public class ByTestAttributeSelector extends ByCssSelector {
    private static final long serialVersionUID = 1L;
    public static final String TEST_ATTR_NAME = "data-test-id";

    public ByTestAttributeSelector(String testAttributeValue) {
        super(new StringBuilder().append("[").append(ByTestAttributeSelector.TEST_ATTR_NAME).append("=")
                .append(testAttributeValue).append("]").toString());
    }

    public static By create(final String testAttributeValue) {
        if (StringUtils.isBlank(testAttributeValue)) {
            throw new IllegalArgumentException("Cannot find elements when the test attribue value is blank");
        }
        return new ByTestAttributeSelector(testAttributeValue);
    }
}
