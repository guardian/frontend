package com.gu.test.Common;

import com.github.tomakehurst.wiremock.verification.LoggedRequest;
import com.gu.test.HttpMock;
import com.gu.test.helpers.PageHelper;
import com.gu.test.pages.FrontPage;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.List;
import java.util.concurrent.TimeUnit;

import static com.gu.test.helpers.WaitHelper.waitForArticleLoad;

public class UserTrackingTest {
    WebDriver driver;
    private PageHelper pageHelper;
    private FrontPage fronts;
    private HttpMock httpMock;

    @Before
    public void setUp() throws Exception {
        httpMock = new HttpMock();
        httpMock.startServer();

        driver = createWebDriverWithWiremockProxy();

        pageHelper = new PageHelper(driver);
        fronts = pageHelper.goToFrontsForTracking();
    }

    private WebDriver createWebDriverWithWiremockProxy() {
        String PROXY = "localhost:8080";
        Proxy proxy = new org.openqa.selenium.Proxy();
        proxy.setHttpProxy(PROXY).setFtpProxy(PROXY).setSslProxy(PROXY).setSocksProxy(PROXY);
        DesiredCapabilities cap = new DesiredCapabilities();
        cap.setCapability(CapabilityType.PROXY, proxy);
        driver = new FirefoxDriver(cap);
        driver.manage().timeouts().implicitlyWait(100, TimeUnit.SECONDS);
        return  driver;
    }

    @Test
    public void theCorrectTrackingInformationShouldBeSentForSportArticle() throws Exception {
        fronts.goToArticleInSportContainer();
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
        fronts.goToArticleInPeople();
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
        pageHelper.endTest();
        httpMock.stopServer();
    }
}