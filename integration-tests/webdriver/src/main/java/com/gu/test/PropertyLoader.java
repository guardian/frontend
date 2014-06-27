package com.gu.test;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * Loads properties from a fixed file but can be overriden by specifying the environment variable of value
 * {@link #PROP_FILE_PATH_ENV_KEY} which can be set by providing a VM arguments like:
 * 
 * <pre>
 * -DTEST_PROPERTY_OVERRIDE_PATH="/home/shahin/local-config.properties"
 * </pre>
 */
public class PropertyLoader {

    private static final Log LOG = LogFactory.getLog(PropertyLoader.class);
    private static final String DEFAULT_PROPERTIES_FILE = "base.properties";
    static final String PROP_FILE_PATH_ENV_KEY = "TEST_PROPERTY_OVERRIDE_PATH";

    public static String getProperty(String name) {
        String property = loadProperties().getProperty(name);
        LOG.info("Getting property by name/value: " + name + "/" + property);
        return property;
    }

    public static Properties loadProperties() {
        Properties loadedProperties = new Properties();
        try {
            loadedProperties.load(PropertyLoader.class.getClassLoader().getResourceAsStream(DEFAULT_PROPERTIES_FILE));
        } catch (IOException e) {
            throw new RuntimeException("Could not load base property file", e);
        }

        addOverridePropertiesIfExists(loadedProperties);

        return loadedProperties;
    }

    private static void addOverridePropertiesIfExists(Properties loadedProperties) {
        try {
            loadedProperties.putAll(loadOverrideProperties());
            LOG.info("Successfully loaded property override file");
        } catch (Exception e) {
            LOG.info(
                    "Could not load override properties so will use the base properties only. Reason:  "
                            + e.getMessage(), e);
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
            throw new RuntimeException("Could not load property override file: " + propertyFilePath, e);
        } finally {
            IOUtils.closeQuietly(propertyStream);
        }
    }

    private static String getOverridePropertyFilePath() {
        return System.getenv(PROP_FILE_PATH_ENV_KEY);
    }

}
