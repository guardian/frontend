package com.gu.fronts.integration.test.common;

import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static com.gu.fronts.integration.test.config.StaticPropertyLoader.getStubServerPort;

import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.rules.TestName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import com.github.tomakehurst.wiremock.junit.WireMockClassRule;
import com.gu.fronts.integration.test.fw.wiremock.WiremockStubPressedJsonBuilder;

/**
 * as well as setting up the environment by starting WireMock server as well providing methods to automatically load
 * stubbed json responses by convention
 */
public class StubbedFrontsIntegrationTestCase extends FrontsIntegrationTestCase {

    @Rule
    public TestName executingTest = new TestName();

    // the following declarations makes WireMock stay up between test cases
    @ClassRule
    public static WireMockClassRule wireMockRule = new WireMockClassRule(wireMockConfig().port(getStubServerPort(7070)));
    @Rule
    public WireMockClassRule instanceRule = wireMockRule;

    @Autowired
    protected WiremockStubPressedJsonBuilder pressedStub;

    /**
     * Convenience method for returning a Stubs pressed.json file by using the name of the currently executing test
     * method. For this to work this method must be called by the executing test method, or nested method, before
     * accessing the target page and not in any setup or teardown method. Use {@link WiremockStubPressedJsonBuilder} if
     * you instead want to stub a pressed.json by explicitly naming the resource. In both cases make sure that an
     * appropriate pressed.json file is in the classpath under the stubbedData folder (name it
     * [test_method_name]-pressed.json if you are using this method). E.g. calling this method, with path /uk, from test
     * method networkStartPageShouldLoad will attempt to load the stubbed file response from
     * stubbedData/uk/networkStartPageShouldLoad-pressed.json
     */
    protected void stubPressedJson(String path) {
        pressedStub.path(path).withResponse(executingTest.getMethodName() + "-pressed.json");
    }
}
