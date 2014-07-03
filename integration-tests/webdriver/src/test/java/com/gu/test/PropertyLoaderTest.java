package com.gu.test;

import static com.gu.test.PropertyLoader.PROP_FILE_PATH_ENV_KEY;
import static org.junit.Assert.assertEquals;

import java.net.URISyntaxException;

import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

@Ignore("Messing up subsequent runs when trying to read override property file so run it manually only")
public class PropertyLoaderTest {

    @Before
    public void setOverrideFileProperty() throws URISyntaxException {
        System.setProperty(PROP_FILE_PATH_ENV_KEY, "src/test/resources/test-override.properties");
    }

    @After
    public void clearOverrideFileProperty() {
        System.clearProperty(PROP_FILE_PATH_ENV_KEY);
    }

    @Test
    public void shouldLoadBasePropertyFile() {
        assertEquals("http://www.theguardian.com", PropertyLoader.getProperty("baseUrl"));
    }

    @Test
    public void shouldLoadSpecifiedPropertyFile() {
        System.setProperty(PROP_FILE_PATH_ENV_KEY, "src/test/resources/test-override.properties");
        assertEquals("overriden", PropertyLoader.getProperty("saucelabs.remotedriver.url"));
    }

    @Test
    public void shouldLoadPropertyValueFromSystemProperty() {
        System.setProperty("only.in.override", "system_overriden");
        assertEquals("system_overriden", PropertyLoader.getProperty("only.in.override"));
        System.clearProperty("only.in.override");
    }

}
