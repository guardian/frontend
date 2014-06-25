package com.gu.test;

import static com.gu.test.PropertyLoader.PROP_FILE_PATH_ENV_KEY;
import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class PropertyLoaderTest {

    @Test
    public void shouldLoadDefaultPropertyFile() {
        System.clearProperty(PROP_FILE_PATH_ENV_KEY);
        assertEquals("http://m.code.dev-theguardian.com", PropertyLoader.getProperty("baseUrl"));
    }

    @Test
    public void shouldLoadSpecifiedPropertyFile() {
        System.setProperty(PROP_FILE_PATH_ENV_KEY, "src/test/resources/test-config.properties");
        assertEquals("http://www.theguardian.com/uk", PropertyLoader.getProperty("baseUrl"));
    }

}
