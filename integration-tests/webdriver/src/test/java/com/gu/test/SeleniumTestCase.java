package com.gu.test;

import static com.gu.test.WebDriverFactory.createWebDriver;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.rules.TestName;
import org.openqa.selenium.WebDriver;

import com.gu.test.helpers.PageHelper;

public class SeleniumTestCase {
    protected WebDriver driver;
    protected PageHelper pageHelper;
    @Rule
    public TestName executingTest = new TestName();

    @Before
    public void setUp() throws Exception {
        driver = createWebDriver(this.getClass().getSimpleName() + "." + executingTest.getMethodName());
        pageHelper = new PageHelper(driver);
    }

    @After
    public void tearDown() throws Exception {
        pageHelper.endTest();
    }

}
