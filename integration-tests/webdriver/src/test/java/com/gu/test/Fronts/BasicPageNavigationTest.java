package com.gu.test.Fronts;

import com.gu.test.TestRunner;
import com.gu.test.pages.Article;
import com.gu.test.pages.FrontPage;
import org.junit.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import java.util.concurrent.TimeUnit;

public class BasicPageNavigationTest {
    WebDriver driver;
    private TestRunner testRunner;
    private FrontPage fronts;
    private Article article;

    @Before
    public void setUp() throws Exception {
        driver = new FirefoxDriver();
        driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
        testRunner = new TestRunner(driver);
        fronts = testRunner.goToFronts(driver);
    }

    @Test
    public void expandCommentIsFreeSection() throws Exception{
        fronts.expandContainer("comment");
        Boolean commentIsExpanded = driver.findElement(By.xpath("//section[@data-component=\"comment\"]//li[@data-link-name=\"trail | 8\"]")).isDisplayed();
        Assert.assertTrue("The comment section did not expand", commentIsExpanded );
    }

    @Test
    public void hideFeaturesContainer() throws Exception{
        String container = "features";
        fronts.hideContainer(container);
        Assert.assertEquals(fronts.currentStateOfShowHide(container),"Show");

    }


    @Test
    public void showPeopleContainer() throws Exception{
        String container = "people";
        fronts.hideContainer(container);
        driver.navigate().refresh();
        fronts.showContainer(container);
        Assert.assertEquals(fronts.currentStateOfShowHide(container),"Hide");

    }


    @After
    public void tearDown() throws Exception {
        testRunner.endTest(driver);
    }
}

