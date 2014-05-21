package com.gu.test;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

import java.util.concurrent.TimeUnit;

public class WebDriverFactory {



    public static WebDriver createWebDriver() {
        FirefoxDriver firefoxDriver = new FirefoxDriver();
        firefoxDriver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
        return firefoxDriver;
    }
}
