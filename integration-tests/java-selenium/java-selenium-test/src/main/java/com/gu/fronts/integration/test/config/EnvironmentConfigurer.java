package com.gu.fronts.integration.test.config;

import static java.lang.System.getProperty;
import static java.lang.System.setProperty;
import static org.apache.commons.lang3.StringUtils.isBlank;

public class EnvironmentConfigurer {

    public static final String ENVIRONMENT_KEY = "environment";

    public static void setupEnvironmentProperty() {
        setProperty(ENVIRONMENT_KEY, getEnvironmentProperty());
    }

    public static String getEnvironmentProperty() {
        String alreadySetEnvProperty = getProperty(ENVIRONMENT_KEY);
        if (isBlank(alreadySetEnvProperty)) {
            return "local";
        } else {
            return alreadySetEnvProperty;
        }
    }
}
