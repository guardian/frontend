package com.gu.fronts.integration.test.journeys

import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage.IN_PICTURES_CONTAINER_ID
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage.SPORT_CONTAINER_ID
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage.TOP_STORIES_CONTAINER_ID
import com.gu.fronts.integration.test.util.CalendarUtil.todayDayOfWeek
import com.gu.fronts.integration.test.util.CalendarUtil.todayYearMonthDay
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.experimental.categories.Category
import org.openqa.selenium.WebElement
import com.gu.fronts.integration.test.common.FrontsIntegrationTestCase
import com.gu.fronts.integration.test.page.common.Article
import com.gu.fronts.integration.test.page.common.FaciaArticle
import com.gu.fronts.integration.test.page.common.FaciaContainer
import com.gu.fronts.integration.test.page.common.FaciaGalleryItem
import com.gu.fronts.integration.test.page.common.GalleryOverlay
import com.gu.fronts.integration.test.page.nwfront.NetworkFrontPage

class NetworkFrontTest extends FrontsIntegrationTestCase {

  @Test
  def networkStartPageBasicJourney() {
    var networkFrontPage = openNetworkFrontPage().isDisplayed
    networkFrontPage = checkHeaderAndFooter(networkFrontPage)
    networkFrontPage = checkEditions(networkFrontPage)
    networkFrontPage = checkDate(networkFrontPage)
    networkFrontPage = checkContainerExpandButton(networkFrontPage)
    val sportsContainer = networkFrontPage.containers().containerWithId(SPORT_CONTAINER_ID).isDisplayed
    val standaloneSports = sportsContainer.clickHeader()
    standaloneSports.isDisplayed
  }

  private def checkHeaderAndFooter(networkFrontPage:NetworkFrontPage): NetworkFrontPage = {
    networkFrontPage.footer().isDisplayed
    networkFrontPage.header().isDisplayed
    var newNetworkFrontPage = networkFrontPage.header().clickLogo()
    newNetworkFrontPage.isDisplayed
    newNetworkFrontPage = networkFrontPage.footer().clickLogo()
    networkFrontPage.isDisplayed
    networkFrontPage
  }
  
  private def checkEditions(networkFrontPage:NetworkFrontPage): NetworkFrontPage = {
    networkFrontPage.header().editions().isDisplayed
    networkFrontPage.header().editions().isUkEditionSelected
    networkFrontPage.header().editions().isUsEditionPresent
    networkFrontPage.header().editions().isAuEditionPresent
    networkFrontPage
  }

  private def checkDate(networkFrontPage:NetworkFrontPage): NetworkFrontPage = {
    networkFrontPage.dateBox().isDisplayed
    assertEquals(todayYearMonthDay(), networkFrontPage.dateBox().getDate)
    assertEquals(todayDayOfWeek(), networkFrontPage.dateBox().getDayOfWeek)
    networkFrontPage
  }

  private def checkContainerExpandButton(networkFrontPage:NetworkFrontPage): NetworkFrontPage = {
    networkFrontPage.containers().containerWithId(TOP_STORIES_CONTAINER_ID).expand().isDisplayed
    networkFrontPage
  }
}