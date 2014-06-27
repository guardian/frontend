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
 * -Denv.test-property-file="/home/shahin/local-config.properties"<br>
 */
public class PropertyLoader {

    private static final Log LOG = LogFactory.getLog(PropertyLoader.class);
    private static final String DEFAULT_PROPERTIES_FILE = "base.properties";
    static final String PROP_FILE_PATH_ENV_KEY = "env.test-property-file";

    public static String getProperty(String name) {
        LOG.info("Getting property by name: " + name);
        return loadProperties().getProperty(name);
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
        } catch (Exception e) {
            LOG.info("Could not load override properties so will use the base properties only. Reason:  "
                    + e.getMessage());
        }
        LOG.info("Successfully loaded property override file");
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
            throw new RuntimeException("Could not load override property file: " + propertyFilePath, e);
        } finally {
            IOUtils.closeQuietly(propertyStream);
        }
    }

    private static String getOverridePropertyFilePath() {
        return System.getProperty(PROP_FILE_PATH_ENV_KEY);
    }

}
