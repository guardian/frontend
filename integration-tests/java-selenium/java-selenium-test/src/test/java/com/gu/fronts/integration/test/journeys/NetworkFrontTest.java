package com.gu.fronts.integration.test.journeys;

import static com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage.IN_PICTURES_CONTAINER_ID;
import static com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage.SPORT_CONTAINER_ID;
import static com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage.TOP_STORIES_CONTAINER_ID;
import static com.gu.fronts.integration.test.util.CalendarUtil.todayDayOfWeek;
import static com.gu.fronts.integration.test.util.CalendarUtil.todayYearMonthDay;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.WebElement;

import com.gu.fronts.integration.test.categories.ProductionOnly;
import com.gu.fronts.integration.test.common.FrontsIntegrationTestCase;
import com.gu.fronts.integration.test.page.common.Article;
import com.gu.fronts.integration.test.page.common.FaciaArticle;
import com.gu.fronts.integration.test.page.common.FaciaContainer;
import com.gu.fronts.integration.test.page.common.FaciaGalleryItem;
import com.gu.fronts.integration.test.page.common.GalleryOverlay;
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage;

public class NetworkFrontTest extends FrontsIntegrationTestCase {

    @Test
    @Category(ProductionOnly.class)
    public void networkStartPageBasicJourney() throws Exception {

        networkFrontPage = openNetworkFrontPage().isDisplayed();
        networkFrontPage = checkHeaderAndFooter();
        networkFrontPage = checkEditions();
        networkFrontPage = checkDate();
        networkFrontPage = checkContainerExpandButton();

        FaciaContainer sportsContainer = networkFrontPage.containers().containerWithId(SPORT_CONTAINER_ID)
                .isDisplayed();
        FaciaContainer standaloneSports = sportsContainer.clickHeader();
        standaloneSports.isDisplayed();
    }

    @Test
    @Category(ProductionOnly.class)
    public void networkFrontPageClickThroughArticleJourney() throws Exception {
        networkFrontPage = openNetworkFrontPage();
        networkFrontPage = networkFrontPage.isDisplayed();

        FaciaContainer topStoriesContainer = networkFrontPage.containers().containerWithId(TOP_STORIES_CONTAINER_ID)
                .isDisplayed();
        FaciaArticle firstArticleContainer = topStoriesContainer.articleAt(0).isDisplayed();

        // get this now before clicking to the article
        String headlineLinkText = firstArticleContainer.headlineLinkText();
        Article article = firstArticleContainer.clickHeadlineLink();
        article.isDisplayed();

        assertEquals("Headline of clicked through article and referring article was not same", headlineLinkText,
                article.headlineText());
    }

    @Test
    @Category(ProductionOnly.class)
    public void networkFrontPageClickThroughPictureGallery() throws Exception {
        networkFrontPage = openNetworkFrontPage();

        FaciaContainer inPicturesContainer = networkFrontPage.containers().containerWithId(IN_PICTURES_CONTAINER_ID)
                .isDisplayed();
        FaciaGalleryItem galleryItem = inPicturesContainer.galleryAt(0).isDisplayed();
        GalleryOverlay galleryOverlay = galleryItem.clickPicture().isDisplayed();
        // make sure we are still on the network front page
        networkFrontPage.isDisplayed();

        galleryOverlay.clickGalleryGridMode();
        galleryOverlay.clickGalleryFullMode();

        WebElement displayedImageBefore = galleryOverlay.getDisplayedImage();
        galleryOverlay.clickNextGallery();
        // give some time for next image to become active
        Thread.sleep(200);
        WebElement displayedImageAfter = galleryOverlay.getDisplayedImage();
        assertTrue("Displayed image did not change after clicking Next Picture",
                !displayedImageBefore.equals(displayedImageAfter));

        networkFrontPage = galleryOverlay.close();
        networkFrontPage.isDisplayed();
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
        networkFrontPage.header().editions().isUsEditionPresent();
        networkFrontPage.header().editions().isAuEditionPresent();
        return networkFrontPage;
    }

    private NetworkFrontPage checkContainerExpandButton() {
        networkFrontPage.containers().containerWithId(TOP_STORIES_CONTAINER_ID).expand().isDisplayed();
        return networkFrontPage;
    }
}
