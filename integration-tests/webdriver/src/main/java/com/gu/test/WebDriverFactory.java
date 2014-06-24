package com.gu.test;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.URL;
import java.util.concurrent.TimeUnit;

public class WebDriverFactory {

    public static final String SAUCELABS_URL = new Config().getHubUrl();
    public static final String BROWSER_VERSION = "30";
    public static final String OS_VERSION = "Windows 7";

    public static WebDriver createWebDriver() throws Exception {

        WebDriver driver;
        // Choose the browser, version, and platform to test
        DesiredCapabilities capabilities = DesiredCapabilities.firefox();
        capabilities.setCapability("version", BROWSER_VERSION);
        capabilities.setCapability("platform", OS_VERSION);

        // Create the connection to Sauce Labs to run the tests
        driver = new RemoteWebDriver(
                new URL(SAUCELABS_URL),
                capabilities);
        driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
        return driver;
    }
}

