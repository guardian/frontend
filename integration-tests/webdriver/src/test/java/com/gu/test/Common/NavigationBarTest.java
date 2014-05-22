package com.gu.test.Common;

import com.gu.test.helpers.PageHelper;
import com.gu.test.pages.FrontPage;
import com.gu.test.pages.SectionFront;
import com.gu.test.shared.NavigationBar;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriver;

import static com.gu.test.WebDriverFactory.createWebDriver;

public class NavigationBarTest {
    WebDriver driver;
    private PageHelper pageHelper;
    private NavigationBar navigationBar;

    @Before
    public void setUp() throws Exception {
        driver = createWebDriver();
        pageHelper = new PageHelper(driver);
        navigationBar = new NavigationBar(driver);
        pageHelper.goToFronts();
    }

    @Test
    public void changingFromUKtoUSEdition() throws Exception {
        navigationBar.goToEdition("US");
        Assert.assertTrue("Failure: not seeing US fronts", driver.getCurrentUrl().contentEquals(pageHelper.getBaseUrl() + "/us"));
    }


    @Test
    public void changingFromUKtoAUEdition() throws Exception {
        navigationBar.goToEdition("AU");
        Assert.assertTrue("Failure: not seeing AU fronts", driver.getCurrentUrl().contentEquals(pageHelper.getBaseUrl() + "/au"));
    }

    @Test
    public void goToFootballFrontsViaNavBar() throws Exception {
        navigationBar.goToFootballFront();
        Assert.assertTrue("Failure: not seeing football fronts", driver.getCurrentUrl().contentEquals(pageHelper.getBaseUrl() + "/football"));

    }

    @Test
    public void goToWorldNewsFrontsViaNavBar() throws Exception {
        navigationBar.goToWorldNewsFront();
        Assert.assertTrue("Failure: not seeing world news fronts", driver.getCurrentUrl().contentEquals(pageHelper.getBaseUrl() + "/world"));

    }

    @After
    public void tearDown() throws Exception {
        pageHelper.endTest();
    }
}

