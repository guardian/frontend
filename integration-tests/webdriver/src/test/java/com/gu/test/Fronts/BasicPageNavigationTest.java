package com.gu.test.Fronts;

import com.gu.test.helpers.PageHelper;
import com.gu.test.pages.FrontPage;
import org.junit.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import static com.gu.test.WebDriverFactory.createWebDriver;

public class BasicPageNavigationTest {
    WebDriver driver;
    private PageHelper pageHelper;
    private FrontPage fronts;

    @Before
    public void setUp() throws Exception {
        driver = createWebDriver();
        pageHelper = new PageHelper(driver);
        fronts = pageHelper.goToFronts();
    }

    @Test
    public void expandCommentIsFreeSection() throws Exception {
        fronts.expandContainer("commentanddebate");
        Boolean commentIsExpanded = driver.findElement(By.xpath("//section[@data-component=\"comment\"]//li[@data-link-name=\"trail | 8\"]")).isDisplayed();
        Assert.assertTrue("The comment section did not expand", commentIsExpanded);
    }

    @Test
    public void hideFeaturesContainer() throws Exception {
        String container = "features";
        fronts.hideContainer(container);
        Assert.assertEquals("Section was not hidden", fronts.currentStateOfShowHide(container), "Show");
    }


    @Test
    public void showPeopleContainer() throws Exception {
        String container = "people";
        fronts.hideContainer(container);
        driver.navigate().refresh();
        fronts.showContainer(container);
        Assert.assertEquals("Can't see Hide option on this section", fronts.currentStateOfShowHide(container), "Hide");
    }

    @After
    public void tearDown() throws Exception {
        pageHelper.endTest();
    }
}

