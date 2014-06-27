package com.gu.test;

import static com.gu.test.PropertyLoader.getProperty;

import java.net.URL;
import java.util.concurrent.TimeUnit;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

public class WebDriverFactory {

    private static final Log LOG = LogFactory.getLog(WebDriverFactory.class);
    public static final String SAUCELABS_URL = getProperty("saucelabs.remotedriver.url");
    public static final String BROWSER_VERSION = "30";
    public static final String OS_VERSION = "Windows 7";

    public static WebDriver createWebDriver() throws Exception {

        // Choose the browser, version, and platform to test
        DesiredCapabilities capabilities = DesiredCapabilities.firefox();
        capabilities.setCapability("version", BROWSER_VERSION);
        capabilities.setCapability("platform", OS_VERSION);

        // Create the connection to Sauce Labs to run the tests
        LOG.info("Creating Sauce Labs Webdriver towards: " + SAUCELABS_URL);
        WebDriver driver = new RemoteWebDriver(new URL(SAUCELABS_URL), capabilities);
        driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
        return driver;
    }
}
