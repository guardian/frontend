package model

import com.gu.contentapi.client.utils.format.{ArticleDesign, NewsPillar, StandardDisplay}
import common.{Edition, Localisation}
import conf.Configuration
import model.dotcomrendering.DotcomRenderingUtils.{designTypeAsString, findPillar, makeMatchUrl}
import model.dotcomrendering.pageElements.TextCleaner
import model.dotcomrendering.{Author, DotcomRenderingDataModel, DotcomRenderingUtils, PageFooter, PageType}
import navigation.{FooterLinks, Nav, NavLink, ReaderRevenueLink, ReaderRevenueLinks, Subnav}
import views.support.ContentLayout
import play.api.libs.json
import play.api.libs.json._
import play.api.mvc.RequestHeader

object InteractivesDotcomRenderingDataObject {

  def makeDataObject()(implicit request: RequestHeader): DotcomRenderingDataModel = {

    val author = Author(Some("author byline"), Some("author twitterHandle"))
    val config: json.JsObject = Json.obj("name" -> "Something")
    val pageType = PageType(
      hasShowcaseMainElement = false,
      isFront = false,
      isLiveblog = false,
      isMinuteArticle = false,
      isPaidContent = false,
      isPreview = false,
      isSensitive = false,
    )

    val readerRevenueLinks = ReaderRevenueLinks(
      header = ReaderRevenueLink(
        contribute = "contribute",
        subscribe = "subscribe",
        support = "support",
        supporter = "supporter",
      ),
      footer = ReaderRevenueLink(
        contribute = "contribute",
        subscribe = "subscribe",
        support = "support",
        supporter = "supporter",
      ),
      sideMenu = ReaderRevenueLink(
        contribute = "contribute",
        subscribe = "subscribe",
        support = "support",
        supporter = "supporter",
      ),
      ampHeader = ReaderRevenueLink(
        contribute = "contribute",
        subscribe = "subscribe",
        support = "support",
        supporter = "supporter",
      ),
      ampFooter = ReaderRevenueLink(
        contribute = "contribute",
        subscribe = "subscribe",
        support = "support",
        supporter = "supporter",
      ),
    )

    val nav = Nav(
      currentUrl = "currentUrl",
      pillars = List(),
      otherLinks = List(),
      brandExtensions = List(),
      currentNavLinkTitle = None,
      currentPillarTitle = None,
      subNavSections = None,
      readerRevenueLinks = readerRevenueLinks,
    )

    val pageFooter: PageFooter = PageFooter(
      FooterLinks.getFooterByEdition(Edition(request)),
    )

    DotcomRenderingDataModel(
      version = 3, // Int
      headline = "headline",
      standfirst = "standfirst",
      webTitle = "webTitle",
      mainMediaElements = List(),
      main = "main",
      keyEvents = List(),
      blocks = List(),
      pagination = None,
      author = author,
      webPublicationDate = "2021-04-22T14:11:12.000Z",
      webPublicationDateDisplay = "Thu 22 Apr 2021 15.11 BST",
      webPublicationSecondaryDateDisplay = "First published on Thu 22 Apr 2021 11.00 BST",
      editionLongForm = "UK edition",
      editionId = "UK",
      pageId = "pageId",
      format = ContentFormat(ArticleDesign, NewsPillar, StandardDisplay),
      designType = "designType",
      tags = List(),
      pillar = "pillar",
      isImmersive = false,
      sectionLabel = "sectionLabel",
      sectionUrl = "sectionUrl",
      sectionName = None,
      subMetaSectionLinks = List(),
      subMetaKeywordLinks = List(),
      shouldHideAds = true,
      isAdFreeUser = false,
      webURL = "webURL",
      linkedData = List(),
      openGraphData = Map(),
      twitterData = Map(),
      config = config,
      guardianBaseURL = "https://www.theguardian.com",
      contentType = "contentType",
      hasRelated = false,
      hasStoryPackage = false,
      beaconURL = "//phar.gu-web.net",
      isCommentable = false,
      commercialProperties = Map(),
      pageType = pageType,
      starRating = None,
      trailText = "trailText",
      nav = nav,
      showBottomSocialButtons = false,
      pageFooter = pageFooter,
      publication = "publication",
      shouldHideReaderRevenue = true,
      slotMachineFlags = "",
      contributionsServiceUrl = "https://contributions.guardianapis.com",
      badge = None,
      matchUrl = None,
      isSpecialReport = false,
    )
  }

}
