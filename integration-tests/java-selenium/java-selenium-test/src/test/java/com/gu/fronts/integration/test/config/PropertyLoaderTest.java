package com.gu.fronts.integration.test.config;

import static com.gu.fronts.integration.test.config.PropertyLoader.PROP_FILE_PATH_ENV_KEY;
import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class PropertyLoaderTest {

    @Test
    public void shouldLoadBasePropertyFile() {
        System.setProperty(PROP_FILE_PATH_ENV_KEY, "src/test/resources/test-override.properties");
        assertEquals("http://www.theguardian.com", PropertyLoader.getProperty("fronts.base.url"));
    }

    @Test
    public void shouldLoadSpecifiedPropertyFile() {
        System.setProperty(PROP_FILE_PATH_ENV_KEY, "src/test/resources/test-override.properties");
        assertEquals("overriden", PropertyLoader.getProperty("saucelabs.remotedriver.url"));
    }

}
