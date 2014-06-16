package com.gu.fronts.integration.test.features;

import static com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlMatching;
import static com.github.tomakehurst.wiremock.client.WireMock.verify;
import static com.gu.fronts.integration.test.util.CalendarUtil.todayDayOfWeek;
import static com.gu.fronts.integration.test.util.CalendarUtil.todayYearMonthDay;
import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.gu.fronts.integration.test.categories.Stubbed;
import com.gu.fronts.integration.test.common.StubbedFrontsIntegrationTestCase;
import com.gu.fronts.integration.test.config.SpringTestConfig;
import com.gu.fronts.integration.test.page.NetworkFrontPage;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = SpringTestConfig.class)
public class NetworkFrontTest extends StubbedFrontsIntegrationTestCase {

    @Test
    @Category(Stubbed.class)
    public void networkStartPageBasicJourney() throws Exception {
        pressedStub.path("/uk").withResponse("NetworkStartPage-pressed.json");
        networkFrontPage = openNetworkFrontPage();

        networkFrontPage = networkFrontPage.isDisplayed();

        networkFrontPage = checkHeaderAndFooter();

        networkFrontPage = checkEditions();

        networkFrontPage = checkDate();

        networkFrontPage.containers().containerWithTestAttributeId("top-stories");

        // not really neccessary to do this, because the test would have failed already if the stub was not properly
        // returning responses, but just to illustrate how it works
        verify(getRequestedFor(urlMatching(".*/uk/.*")));
    }

    private NetworkFrontPage checkHeaderAndFooter() {
        networkFrontPage.footer().isDisplayed();
        networkFrontPage.header().isDisplayed();
        networkFrontPage = networkFrontPage.header().clickLogo();
        networkFrontPage.isDisplayed();
        networkFrontPage = networkFrontPage.footer().clickLogo();
        networkFrontPage.isDisplayed();
        return networkFrontPage;
    }

    private NetworkFrontPage checkDate() {
        networkFrontPage.dateBox().isDisplayed();
        assertEquals(todayYearMonthDay(), networkFrontPage.dateBox().getDate());
        assertEquals(todayDayOfWeek(), networkFrontPage.dateBox().getDayOfWeek());
        return networkFrontPage;
    }

    private NetworkFrontPage checkEditions() {
        networkFrontPage.header().editions().isDisplayed();
        networkFrontPage.header().editions().isUkEditionSelected();
        networkFrontPage.header().editions().usUsEditionPresent();
        networkFrontPage.header().editions().isAuEditionPresent();
        return networkFrontPage;
    }
}
