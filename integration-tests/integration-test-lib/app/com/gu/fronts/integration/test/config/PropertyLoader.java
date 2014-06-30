package com.gu.fronts.integration.test.config;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * This class loads properties from the classpath with an option to override by providing the path to an additional
 * property file.
 * 
 * To use this property loading mechanism a file specified by {@link #DEFAULT_PROPERTIES_FILE} HAS to be put in the
 * classpath. Then any property CAN then be overriden by creating another property file and specify the system property
 * of {@link #PROP_FILE_PATH_ENV_KEY} which can be set by providing a VM argument like:
 * 
 * <pre>
 * -DTEST_PROPERTY_OVERRIDE_PATH=/home/shahin/local-config.properties
 * </pre>
 * 
 * This will override *only* those properties specified in the override file. Other properties will be left untouched.
 */
public class PropertyLoader {

    private static final Log LOG = LogFactory.getLog(PropertyLoader.class);
    static final String DEFAULT_PROPERTIES_FILE = "base.properties";
    public static final String PROP_FILE_PATH_ENV_KEY = "TEST_PROPERTY_OVERRIDE_PATH";
    // prop names
    public static final String SAUCELABS_REMOTEDRIVER_URL = "saucelabs.remotedriver.url";

    public static String getProperty(String name) {
        String property = loadProperties(DEFAULT_PROPERTIES_FILE).getProperty(name);
        LOG.info("Getting property by name/value: " + name + "/" + property);
        return property;
    }

    private static Properties loadProperties(String defaultPropertiesFile) {
        Properties loadedProperties = new Properties();
        try {
            loadedProperties.load(PropertyLoader.class.getClassLoader().getResourceAsStream(defaultPropertiesFile));
        } catch (Exception e) {
            // fallback as for some reason resources has to be prepended for it to be found when running in an IDE
            try {
                loadedProperties.load(PropertyLoader.class.getClassLoader().getResourceAsStream(
                        "resources/" + defaultPropertiesFile));
            } catch (Exception e1) {
                throw new RuntimeException("Could not load base property file", e);
            }
        }

        addOverridePropertiesIfExists(loadedProperties);

        return loadedProperties;
    }

    private static void addOverridePropertiesIfExists(Properties loadedProperties) {
        try {
            loadedProperties.putAll(loadOverrideProperties());
            LOG.info("Successfully loaded property override file");
        } catch (Exception e) {
            LOG.info("Could not load override properties so will use the base properties only. Reason:  "
                    + e.getMessage());
        }
    }

    private static Properties loadOverrideProperties() {
        String propertyFilePath = getOverridePropertyFilePath();

        InputStream propertyStream = null;
        try {
            propertyStream = new FileInputStream(propertyFilePath);
            Properties overrideProperties = new Properties();
            overrideProperties.load(propertyStream);
            return overrideProperties;
        } catch (Exception e) {
            throw new RuntimeException("Could not load property override file: " + propertyFilePath + " due to "
                    + e.getMessage(), e);
        } finally {
            IOUtils.closeQuietly(propertyStream);
        }
    }

    private static String getOverridePropertyFilePath() {
        return System.getProperty(PROP_FILE_PATH_ENV_KEY);
    }

}
