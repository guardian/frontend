package com.gu.fronts.integration.test.journeys;

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
import com.gu.fronts.integration.test.page.common.Article;
import com.gu.fronts.integration.test.page.common.FaciaContainer;
import com.gu.fronts.integration.test.page.common.FaciaContainerArticle;
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage;

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
        networkFrontPage = checkContainerExpandButton();

        // not really neccessary to do this, because the test would have failed anyway if the stub was not properly
        // returning responses, but just to illustrate how it works, would the need arise to verify the requests sent to
        // the stubs. The below, for example, checks that a request has been made to the AWS stub with the uk path in it
        verify(getRequestedFor(urlMatching(".*/uk/.*")));
    }

    @Test
    @Category(Stubbed.class)
    public void networkFrontPageClickThroughArticleJourney() throws Exception {
        pressedStub.path("/uk").withResponse("NetworkStartPageSmall-pressed.json");
        networkFrontPage = openNetworkFrontPage();
        networkFrontPage = networkFrontPage.isDisplayed();

        FaciaContainer topStoriesContainer = networkFrontPage.containers().containerWithTestAttributeId("top-stories")
                .isDisplayed();
        FaciaContainerArticle firstArticleContainer = topStoriesContainer.articleAt(0).isDisplayed();
        
        //get this now before clicking to the article
        String headlineLinkText = firstArticleContainer.headlineLinkText();
        Article article = firstArticleContainer.clickHeadlineLink();
        article.isDisplayed();
        
        assertEquals("Headline of clicked through article and referring article was not same",
                headlineLinkText, article.headlineText());
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
    
    private NetworkFrontPage checkContainerExpandButton() {
        networkFrontPage.containers().containerWithTestAttributeId("top-stories").expand().isDisplayed();
        return networkFrontPage;
    }
}
