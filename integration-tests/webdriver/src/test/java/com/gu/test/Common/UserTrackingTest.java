package com.gu.test.Common;

import com.github.tomakehurst.wiremock.verification.LoggedRequest;
import com.gu.test.HttpMock;
import com.gu.test.pages.Article;
import com.gu.test.pages.FrontPage;
import com.gu.test.TestRunner;
import org.junit.*;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;


import java.util.List;
import java.util.concurrent.TimeUnit;

public class UserTrackingTest {
    WebDriver driver;
    private TestRunner testRunner;
    private FrontPage fronts;
    private HttpMock httpMock;

    @Before
    public void setUp() throws Exception {

      httpMock = new HttpMock();
      httpMock.startServer();
        FirefoxProfile profile = new FirefoxProfile();
        profile.setPreference("network.proxy.http", "localhost");
        profile.setPreference("network.proxy.http_port", "8080");
        driver = new FirefoxDriver(profile);
        driver.manage().timeouts().implicitlyWait(20, TimeUnit.SECONDS);

        testRunner = new TestRunner(driver);
        fronts = testRunner.goToFrontsForTracking(driver);
    }


    @Test
    public void theCorrectTrackingInformationShouldBeSentForSportArticle() throws Exception {

        Article sportArticle = fronts.goToArticleInSportContainer();
        sportArticle.waitForArticleLoad(driver);
        List<LoggedRequest> requests = httpMock.findAllRequestsTo("ophan.theguardian.com");
        String dataComponent = "sport";

        boolean contains = false;
        for (LoggedRequest request : requests) {
            if (request.getUrl().contains("referringComponent=" + dataComponent)) {
                contains = true;
            }
        }

        Assert.assertTrue("Failure: Tracking Not Found", contains);

    }

    @Test
    public void theCorrectTrackingInformationShouldBeSentForPeopleArticle() throws Exception {

        Article sportArticle = fronts.goToArticleInPeople();
        sportArticle.waitForArticleLoad(driver);
        List<LoggedRequest> requests = httpMock.findAllRequestsTo("ophan.theguardian.com");
        String dataComponent = "people";

        boolean contains = false;
        for (LoggedRequest request : requests) {
            if (request.getUrl().contains("referringComponent=" + dataComponent)) {
                contains = true;
            }
        }

        Assert.assertTrue("Failure: Tracking Not Found", contains);

    }


    @After
    public void tearDown() throws Exception {

        testRunner.endTest(driver);
        httpMock.stopServer();
    }
}