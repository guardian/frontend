package com.gu.fronts.integration.test.config;

import static com.gu.fronts.integration.test.config.EnvironmentConfigurer.ENVIRONMENT_KEY;
import static java.util.concurrent.TimeUnit.SECONDS;

import java.io.File;
import java.io.IOException;

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
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.Scope;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;

@Configuration
@ComponentScan({ "com.gu.fronts.integration" })
@PropertySource(value = { "classpath:${" + ENVIRONMENT_KEY + "}-config.properties" })
public class SpringTestConfig {

    @Bean(name = "firefox", destroyMethod = "quit")
    @Scope("prototype")
    public WebDriver getFirefoxWebdriver() {
        DesiredCapabilities desiredCap = DesiredCapabilities.firefox();
        desiredCap.setCapability("applicationCacheEnabled", false);
        return setGlobalWebdriverConf(new FirefoxDriver());
    }

    private WebDriver setGlobalWebdriverConf(WebDriver webDriver) {
        webDriver.manage().window().setPosition(new Point(0, 0));
        webDriver.manage().window().setSize(new Dimension(1600, 1024));
        webDriver.manage().timeouts().implicitlyWait(10, SECONDS);
        //configureScreenshot(webDriver);
        return webDriver;
    }

    private void configureScreenshot(WebDriver webDriver) {
        File scrFile = ((TakesScreenshot) webDriver).getScreenshotAs(OutputType.FILE);
        try {
            FileUtils.copyFile(scrFile, new File("/tmp/selenium_screenshot.png"));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Use this only if you have Selenium Chrome Webdriver installed
     */
    @Bean(name = "chrome", destroyMethod = "quit")
    @Scope("prototype")
    @Deprecated()
    public WebDriver getChromeWebdriver() {
        // String chromeDriverPath = this.getClass().getClassLoader().getResource("drivers/chromedriver").getPath();
        // System.setProperty("webdriver.chrome.driver", chromeDriverPath);
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--disable-application-cache");
        WebDriver webDriver = new ChromeDriver(options);
        return setGlobalWebdriverConf(webDriver);
    }

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        return new PropertySourcesPlaceholderConfigurer();
    }

}
