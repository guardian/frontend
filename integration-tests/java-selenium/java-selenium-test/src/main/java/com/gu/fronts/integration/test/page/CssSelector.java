package com.gu.fronts.integration.test.page;

public class CssSelector {

    public static final String TEST_ATTR_NAME = "data-test-id";

    /**
     * Creates a CSS selector for a test attribute using the provided value and {@link #TEST_ATTR_NAME}
     */
    public static final String testAttrId(String attrValue) {
        return String.format("[%s=%s]", TEST_ATTR_NAME, attrValue);
    }

}
