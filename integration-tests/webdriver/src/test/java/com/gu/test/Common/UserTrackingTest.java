package com.gu.test.Common;

import com.github.tomakehurst.wiremock.junit.WireMockRule;
import com.github.tomakehurst.wiremock.verification.LoggedRequest;
import com.gu.test.HttpMock;
import com.gu.test.pages.Article;
import com.gu.test.pages.FrontPage;
import com.gu.test.TestRunner;
import org.junit.*;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.List;
import java.util.concurrent.TimeUnit;

import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;

public class UserTrackingTest {
    WebDriver driver;
    private TestRunner testRunner;
    private FrontPage fronts;
    private HttpMock httpMock;

    @Before
    public void setUp() throws Exception {

        httpMock = new HttpMock();
        httpMock.startServer();

        String PROXY = "localhost:8080";
        org.openqa.selenium.Proxy proxy = new org.openqa.selenium.Proxy();
        proxy.setHttpProxy(PROXY).setFtpProxy(PROXY).setSslProxy(PROXY).setSocksProxy(PROXY);
        DesiredCapabilities cap = new DesiredCapabilities();
        cap.setCapability(CapabilityType.PROXY, proxy);
        driver = new FirefoxDriver(cap);
        driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);

        testRunner = new TestRunner(driver);
        fronts = testRunner.goToFronts(driver);
    }


    @Test
    public void theCorrectTrackingInformationShouldBeSentForSportArticle() throws Exception {

        Article sportArticle = fronts.goToArticleInSportContainer(driver);
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


    @After
    public void tearDown() throws Exception {
        httpMock.stopServer();
        testRunner.endTest(driver);
    }
}