package com.gu.fronts.integration.test.config;

import static com.gu.fronts.integration.test.config.EnvironmentConfigurer.getEnvironmentProperty;
import static java.lang.Integer.parseInt;
import static org.apache.commons.lang3.math.NumberUtils.isNumber;
import static org.springframework.core.io.support.PropertiesLoaderUtils.loadProperties;

import java.io.IOException;
import java.util.Properties;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

/**
 * This class loads properties in a static way. This is needed because Spring has seemingly no way to inject property
 * values into static fields
 */
public class StaticPropertyLoader {

    public static int getStubServerPort(int defaultValue) {
        Resource resource = new ClassPathResource(getEnvironmentProperty() + "-config.properties");
        try {
            Properties props = loadProperties(resource);
            String stubServerProp = props.getProperty("stub.server.port");
            if (isNumber(stubServerProp)) {
                return parseInt(stubServerProp);
            } else {
                return defaultValue;
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

}
