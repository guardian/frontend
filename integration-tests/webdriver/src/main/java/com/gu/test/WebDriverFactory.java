package com.gu.test;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.concurrent.TimeUnit;

public class WebDriverFactory {



    public static WebDriver createWebDriver() {
        DesiredCapabilities cap = new DesiredCapabilities();
        cap.setCapability(CapabilityType.VERSION, "26");
        FirefoxDriver firefoxDriver = new FirefoxDriver(cap);
        firefoxDriver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
        return firefoxDriver;
    }
}
