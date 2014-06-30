package com.gu.fronts.integration.test.config;

import static com.gu.fronts.integration.test.config.PropertyLoader.SAUCELABS_REMOTEDRIVER_URL;
import static com.gu.fronts.integration.test.config.PropertyLoader.getProperty;
import static java.util.concurrent.TimeUnit.SECONDS;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Point;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

/**
 * Creates RemoteWebdriver instances. Either use {@link #getDefaultWebDriver()} or if you want to specify one yourself
 * use, for example, {@link #getFirefoxWebdriver()}
 */
public class WebdriverFactory {

    public static final String SAUCE_LABS_FIREFOX_VERSION = "30";
    public static final String SAUCE_LABS_OS_VERSION = "Windows 7";

    public static WebDriver getDefaultWebDriver() {
        return getFirefoxWebdriver();
    }

    public static WebDriver getFirefoxWebdriver() {
        DesiredCapabilities desiredCap = DesiredCapabilities.firefox();
        desiredCap.setCapability("applicationCacheEnabled", false);
        return setGlobalWebdriverConf(new FirefoxDriver(), desiredCap);
    }

    public static WebDriver getSauceLabsWebdriver() {
        DesiredCapabilities capabilities = DesiredCapabilities.firefox();
        capabilities.setCapability("version", SAUCE_LABS_FIREFOX_VERSION);
        capabilities.setCapability("platform", SAUCE_LABS_OS_VERSION);

        String sauceLabsUrl = getProperty(SAUCELABS_REMOTEDRIVER_URL);
        // Create the connection to Sauce Labs to run the tests
        try {
            WebDriver driver = new RemoteWebDriver(new URL(sauceLabsUrl), capabilities);
            setGlobalWebdriverConf(driver, capabilities);
            return driver;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Sauce Labs URL was malformed", e);
        }
    }

    /**
     * Use this only if you have Selenium Chrome Webdriver installed
     */
    public static WebDriver getChromeWebdriver() {
        // String chromeDriverPath = this.getClass().getClassLoader().getResource("drivers/chromedriver").getPath();
        // System.setProperty("webdriver.chrome.driver", chromeDriverPath);
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--disable-application-cache");
        WebDriver webDriver = new ChromeDriver(options);
        return setGlobalWebdriverConf(webDriver, new DesiredCapabilities());// use an empty desired capabilities until
                                                                            // we figure out how to set both chrome
                                                                            // options and desired caps
    }

    private static WebDriver setGlobalWebdriverConf(WebDriver webDriver, DesiredCapabilities desiredCap) {
        webDriver.manage().window().setPosition(new Point(0, 0));
        webDriver.manage().window().setSize(new Dimension(1600, 1024));
        webDriver.manage().timeouts().implicitlyWait(10, SECONDS);
        return webDriver;
    }

    // experimental
    private static void configureScreenshot(WebDriver webDriver) {
        File scrFile = ((TakesScreenshot) webDriver).getScreenshotAs(OutputType.FILE);
        try {
            FileUtils.copyFile(scrFile, new File("/tmp/selenium_screenshot.png"));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
