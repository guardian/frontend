package com.gu.fronts.integration;

import static java.lang.System.getProperty;
import static java.lang.System.setProperty;
import static org.apache.commons.lang3.StringUtils.isBlank;

import org.junit.BeforeClass;
import org.openqa.selenium.WebDriver;
import org.springframework.beans.factory.annotation.Autowired;

public class EnvironmentConfigurer {

    public static final String ENVIRONMENT_KEY = "environment";
    
    @Autowired
    protected WebDriver webDriver;

    @BeforeClass
    public static void setupEnvironmentProperty() {
        if (isBlank(getProperty(ENVIRONMENT_KEY))) {
            setProperty(ENVIRONMENT_KEY, "local");
        }
    }
}
