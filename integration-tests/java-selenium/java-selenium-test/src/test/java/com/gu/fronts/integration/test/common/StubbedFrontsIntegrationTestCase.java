package com.gu.fronts.integration.test.common;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static com.gu.fronts.integration.test.common.util.IoUtils.loadPressedJsonStubFile;
import static com.gu.fronts.integration.test.config.StaticPropertyLoader.getStubServerPort;

import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.rules.TestName;
import org.springframework.beans.factory.annotation.Value;

import com.github.tomakehurst.wiremock.junit.WireMockClassRule;

/**
 * as well as setting up the environment by starting WireMock server as well providing methods to automatically load
 * stubbed json responses by convention
 */
public class StubbedFrontsIntegrationTestCase extends FrontsIntegrationTestCase {

    @Rule
    public TestName executingTest = new TestName();

    @Value("${fronts.env}")
    protected String frontsEnv;

    // the following declarations makes WireMock stay up between test cases
    @ClassRule
    public static WireMockClassRule wireMockRule = new WireMockClassRule(wireMockConfig().port(getStubServerPort(7070)));
    @Rule
    public WireMockClassRule instanceRule = wireMockRule;

    /**
     * Stubs pressed.json file by using the name of the currently executing test method. For this to work this method
     * must be called by the executing test method, or nested method, and not in any setup or teardown. Use
     * {@link #stubPressedJsonByFileName(String)} if you instead want to stub a pressed.json by explicitly naming the
     * resource. Also make sure that a pressed.json file is under the stubbedData folder named:
     * [test_method_name]-pressed.json.
     */
    protected void stubPressedJson() {
        stubFor(get(urlEqualTo("/aws-frontend-store/" + frontsEnv + "/frontsapi/pressed/uk/pressed.json")).willReturn(
                aResponse().withStatus(200).withHeader("Content-Type", "application/json")
                        .withBody(loadPressedJsonStubFile(resolveExecutingTestMethodName() + "-pressed.json"))));
    }

    private String resolveExecutingTestMethodName() {
        return executingTest.getMethodName();
    }

    /**
     * Stubs pressed.json by providing the file name. This file must be located in the stubbedData folder
     */
    protected void stubPressedJsonByFileName(String fileName) {
        stubFor(get(urlEqualTo("/aws-frontend-store/" + frontsEnv + "/frontsapi/pressed/uk/pressed.json")).willReturn(
                aResponse().withStatus(200).withHeader("Content-Type", "application/json")
                        .withBody(loadPressedJsonStubFile(fileName))));
    }
}
