package com.gu.test;

import static com.gu.test.PropertyLoader.getProperty;
import static org.apache.commons.lang3.StringUtils.isNotBlank;

import java.net.URL;
import java.util.concurrent.TimeUnit;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

public class WebDriverFactory {

    private static final Log LOG = LogFactory.getLog(WebDriverFactory.class);
    public static final String BROWSER_VERSION = "30";
    public static final String OS_VERSION = "Windows 7";

    public static WebDriver createWebDriver() throws Exception {
        return createWebDriver(null);
    }

    public static WebDriver createWebDriver(String jobName) throws Exception {

        // Choose the browser, version, and platform to test
        DesiredCapabilities capabilities = DesiredCapabilities.firefox();
        capabilities.setCapability("version", BROWSER_VERSION);
        capabilities.setCapability("platform", OS_VERSION);
        if (isNotBlank(jobName)) {
            capabilities.setCapability("name", jobName);
        }

        String sauceLabsUrl = getProperty("saucelabs.remotedriver.url");
        // Create the connection to Sauce Labs to run the tests
        WebDriver driver = new RemoteWebDriver(new URL(sauceLabsUrl), capabilities);
        driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
        return driver;
    }
}
