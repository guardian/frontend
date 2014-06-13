package com.gu.fronts.integration.test.features;

import static com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlMatching;
import static com.github.tomakehurst.wiremock.client.WireMock.verify;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.gu.fronts.integration.test.categories.Stubbed;
import com.gu.fronts.integration.test.common.StubbedFrontsIntegrationTestCase;
import com.gu.fronts.integration.test.config.SpringTestConfig;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = SpringTestConfig.class)
public class NetworkFrontTest extends StubbedFrontsIntegrationTestCase {

    @Test
    @Category(Stubbed.class)
    public void networkStartPageShouldHaveFooterAndHeader() throws Exception {
        pressedStub.path("/uk").withResponse("NetworkStartPage-pressed.json");
        networkFrontPage = openNetworkFrontPage();

        networkFrontPage.isDisplayed();
        networkFrontPage.footer().isDisplayed();
        networkFrontPage.header().isDisplayed();

        networkFrontPage = networkFrontPage.header().clickLogo();
        networkFrontPage.isDisplayed();

        networkFrontPage = networkFrontPage.footer().clickLogo();
        networkFrontPage.isDisplayed();
        // not really neccessary to do this, because the test would have failed already if the stub was not properly
        // returning responses, but just to illustrate how it works
        verify(getRequestedFor(urlMatching(".*/uk/.*")));
    }

    @Test
    @Category(Stubbed.class)
    public void networkStartPageShouldHaveEditionsDisplayedProperly() throws Exception {
        pressedStub.path("/uk").withResponse("NetworkStartPageSmall-pressed.json");
        networkFrontPage = openNetworkFrontPage();

        networkFrontPage.header().editions().isDisplayed();
        networkFrontPage.header().editions().isUkEditionSelected();
        networkFrontPage.header().editions().usUsEditionPresent();
        networkFrontPage.header().editions().isAuEditionPresent();
    }
    
    //@Test
    @Category(Stubbed.class)
    public void networkStartPageShouldHaveDateTitleDisplayedProperly() throws Exception {
        pressedStub.path("/uk").withResponse("NetworkStartPageSmall-pressed.json");
        networkFrontPage = openNetworkFrontPage();

        //TODO
    }
}
