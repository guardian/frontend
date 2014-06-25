package com.gu.test;

import static org.apache.commons.lang3.StringUtils.isBlank;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

import org.apache.commons.io.IOUtils;

/**
 * Loads properties from file specified by environment variable of value {@link #PROP_FILE_PATH_ENV_KEY} which can be
 * set by providing a VM arguments like: -Denv.test-property-file="/home/shahin/local-config.properties"<br>
 * If not set then the file specified by {@link #DEFAULT_PROP_FILE_PATH} will be used
 */
public class PropertyLoader {

    static final String DEFAULT_PROP_FILE_PATH = "src/main/resources/local-config.properties";
    static final String PROP_FILE_PATH_ENV_KEY = "env.test-property-file";

    public static String getProperty(String name) {
        String propertyFilePath = getPropertyFilePath();

        InputStream propertyStream = null;
        try {
            propertyStream = new FileInputStream(propertyFilePath);
            Properties loadedProperties = new Properties();
            loadedProperties.load(propertyStream);
            return loadedProperties.getProperty(name);
        } catch (Exception e) {
            throw new RuntimeException("Could not load property file: " + propertyFilePath, e);
        } finally {
            IOUtils.closeQuietly(propertyStream);
        }
    }

    private static String getPropertyFilePath() {
        String propertyFilePath = System.getProperty(PROP_FILE_PATH_ENV_KEY);
        if (isBlank(propertyFilePath)) {
            return DEFAULT_PROP_FILE_PATH;
        } else {
            return propertyFilePath;
        }
    }

}
