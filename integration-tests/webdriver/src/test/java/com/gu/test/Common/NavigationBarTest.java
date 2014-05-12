package com.gu.test.Common;

import com.gu.test.pages.FrontPage;
import com.gu.test.TestRunner;
import jdk.nashorn.internal.ir.annotations.Ignore;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

import java.util.concurrent.TimeUnit;

public class NavigationBarTest {
    WebDriver driver;
    private TestRunner testRunner;
    private FrontPage fronts;

    @Before
    public void setUp() throws Exception {
        driver = new FirefoxDriver();
        driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
        testRunner = new TestRunner(driver);
        fronts = testRunner.goToFronts(driver);
    }


    @Test
    public void changingFromUKtoUSEdition() throws Exception {
        fronts = fronts.goToEdition("US");
        Assert.assertTrue("Failure: not seeing US fronts", driver.getCurrentUrl().contentEquals(testRunner.getBaseUrl() + "/us"));
    }


    @Test
    public void changingFromUKtoAUEdition() throws Exception {
        fronts = fronts.goToEdition("AU");
        Assert.assertTrue("Failure: not seeing AU fronts", driver.getCurrentUrl().contentEquals(testRunner.getBaseUrl() + "/au"));
    }

    @Ignore
    @Test
    public void goToFootballFrontsViaNavBar() throws Exception {

    }

    @After
    public void tearDown() throws Exception {
        testRunner.endTest(driver);
    }
}

