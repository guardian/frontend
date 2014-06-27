package com.gu.test;

import static com.gu.test.PropertyLoader.PROP_FILE_PATH_ENV_KEY;
import static org.junit.Assert.assertEquals;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class PropertyLoaderTest {

    @Before
    public void setOverrideFileProperty() {
        System.setProperty(PROP_FILE_PATH_ENV_KEY, "src/test/resources/test-override.properties");
    }

    @After
    public void clearOverrideFileProperty() {
        System.clearProperty(PROP_FILE_PATH_ENV_KEY);
    }

    @Test
    public void shouldLoadBasePropertyFile() {
        assertEquals("http://m.code.dev-theguardian.com", PropertyLoader.getProperty("baseUrl"));
    }

    @Test
    public void shouldLoadSpecifiedPropertyFile() {
        System.setProperty(PROP_FILE_PATH_ENV_KEY, "src/test/resources/test-override.properties");
        assertEquals("overriden", PropertyLoader.getProperty("saucelabs.remotedriver.url"));
    }

}
