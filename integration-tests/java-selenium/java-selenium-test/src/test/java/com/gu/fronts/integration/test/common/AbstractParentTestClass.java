package com.gu.fronts.integration.test.common;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.gu.fronts.integration.test.common.util.IoUtils.loadPressedJsonStubFile;

import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.rules.TestName;
import org.openqa.selenium.WebDriver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import com.github.tomakehurst.wiremock.junit.WireMockRule;
import com.gu.fronts.integration.test.config.EnvironmentConfigurer;
import com.gu.fronts.integration.test.page.NetworkFrontPage;
import com.gu.fronts.integration.test.page.util.PageFactoryHelper;

/**
 * This is the super class of all integration test classes. It contains convenience method to get the start (network
 * front page) as well as setting up the environment by starting WireMock server as well providing methods to
 * automatically load stubbed json responses by convention
 */
public class AbstractParentTestClass {

    @Autowired
    protected WebDriver webDriver;
    @Value("${fronts.base.url}")
    private String frontsBaseUrl;
    @Value("${fronts.env}")
    private String frontsEnv;
    @Autowired
    protected PageFactoryHelper pageFactoryHelper;

    @Rule
    public TestName executingTest = new TestName();
    @Rule
    public WireMockRule wireMockRule = new WireMockRule(7070);

    @BeforeClass
    public static void testClassSetup() {
        EnvironmentConfigurer.setupEnvironmentProperty();
    }

    protected NetworkFrontPage openNetworkFrontPage() {
        webDriver.get(frontsBaseUrl);
        return pageFactoryHelper.loadPage(NetworkFrontPage.class, webDriver);
    }

    /**
     * Loads a pressed.json file by using the name of the currently executing test method. For this to work this method
     * must be called by the executing test method, or nested method, and not in any setup or teardown. Use
     * {@link #stubPressedJsonByFileName(String)} if you want to load a pressed.json by explicitly naming the resource.
     */
    protected void stubPressedJson() {
        stubFor(get(urlEqualTo("/aws-frontend-store/" + frontsEnv + "/frontsapi/pressed/uk/pressed.json")).willReturn(
                aResponse().withStatus(200).withHeader("Content-Type", "application/json")
                        .withBody(loadPressedJsonStubFile(resolveExecutingTestMethodName() + ".json"))));
    }

    private String resolveExecutingTestMethodName() {
        return executingTest.getMethodName();
    }

    /**
     * Loads a pressed.json by providing a file name. This file must be located in the stubbedData folder
     */
    protected void stubPressedJsonByFileName(String fileName) {
        stubFor(get(urlEqualTo("/aws-frontend-store/" + frontsEnv + "/frontsapi/pressed/uk/pressed.json")).willReturn(
                aResponse().withStatus(200).withHeader("Content-Type", "application/json")
                        .withBody(loadPressedJsonStubFile(fileName))));
    }
}
