package com.gu.fronts.integration.test.config;

import static com.gu.fronts.integration.test.config.PropertyLoader.PROP_FILE_PATH_ENV_KEY;
import static org.junit.Assert.assertEquals;

import java.io.File;

import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

@Ignore("Only run as single test as otherwise the set/unset of system property might interfere with other tests.")
public class PropertyLoaderTest {

    @Before
    public void setSystemPropertyForOverrideFile() throws Exception {
        File baseProps = new File(PropertyLoader.class.getClassLoader()
                .getResource("resources/" + PropertyLoader.DEFAULT_PROPERTIES_FILE).toURI());
        System.setProperty(PROP_FILE_PATH_ENV_KEY, baseProps.getParent() + "/test-override.properties");
    }

    @After
    public void unsetSystemPropertyForOverrideFile() {
        System.clearProperty(PROP_FILE_PATH_ENV_KEY);
    }

    @Test
    public void shouldLoadPropertyValueFromBasePropertyFile() {
        assertEquals("http://www.theguardian.com", PropertyLoader.getProperty("fronts.base.url"));
    }

    @Test
    public void shouldLoadPropertyValueFromOverridePropertyFile() {
        assertEquals("overriden", PropertyLoader.getProperty("saucelabs.remotedriver.url"));
    }

    @Test
    public void shouldLoadNewPropertyValueFromOverridePropertyFile() {
        assertEquals("overriden2", PropertyLoader.getProperty("only.in.override"));
    }

}
