package com.gu.test.Common;

import com.gu.test.pages.FrontPage;
import com.gu.test.TestRunner;
import com.gu.test.pages.SectionFront;
import com.gu.test.shared.NavigationBar;
import org.junit.*;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

import java.util.concurrent.TimeUnit;

public class NavigationBarTest {
    WebDriver driver;
    private TestRunner testRunner;
    private FrontPage fronts;
    private NavigationBar navigationBar;
    private SectionFront sectionFront;

    @Before
    public void setUp() throws Exception {
        driver = new FirefoxDriver();
        driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
        testRunner = new TestRunner(driver);
        navigationBar = new NavigationBar(driver);
        fronts = testRunner.goToFronts(driver);
    }


    @Test
    public void changingFromUKtoUSEdition() throws Exception {
        fronts = navigationBar.goToEdition("US");
        Assert.assertTrue("Failure: not seeing US fronts", driver.getCurrentUrl().contentEquals(testRunner.getBaseUrl() + "/us"));
    }


    @Test
    public void changingFromUKtoAUEdition() throws Exception {
        fronts = navigationBar.goToEdition("AU");
        Assert.assertTrue("Failure: not seeing AU fronts", driver.getCurrentUrl().contentEquals(testRunner.getBaseUrl() + "/au"));
    }

    @Test
    public void goToFootballFrontsViaNavBar() throws Exception {
        sectionFront = navigationBar.goToFootballFront();
        Assert.assertTrue("Failure: not seeing football fronts", driver.getCurrentUrl().contentEquals(testRunner.getBaseUrl() + "/football"));

    }

    @Test
    public void goToWorldNewsFrontsViaNavBar() throws Exception {
        sectionFront = navigationBar.goToWorldNewsFront();
        Assert.assertTrue("Failure: not seeing world news fronts", driver.getCurrentUrl().contentEquals(testRunner.getBaseUrl() + "/world"));

    }



    @After
    public void tearDown() throws Exception {
        testRunner.endTest(driver);
    }
}

