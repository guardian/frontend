package model

import com.gu.commercial.branding.Branding
import com.gu.commercial.display.AdTargetParam
import com.gu.contentapi.client.utils.format.{ArticleDesign, NewsPillar, StandardDisplay}
import common.commercial.EditionCommercialProperties
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

  def mockDataObject(model: InteractivePage)(implicit request: RequestHeader): DotcomRenderingDataModel = {

    val interactive = model.interactive
    val relatedContent = model.related

    val author = Author(Some("author byline"), Some("author twitterHandle"))
    val config: json.JsObject = Json.obj(
      "abTests" -> Json.obj(),
      "adUnit" -> "/59666047/theguardian.com/news/article/ng",
      "ajaxUrl" -> "https://api.nextgen.guardianapps.co.uk",
      "ampIframeUrl" -> "https://assets.guim.co.uk/data/vendor/8aef390c60b12c2d4425870583ed8245/amp-iframe.html",
      "commercialBundleUrl" -> "https://assets.guim.co.uk/javascripts/1ac3825c94468946aa8d/graun.commercial.dcr.js",
      "contentType" -> "Article",
      "dcrSentryDsn" -> "https://1937ab71c8804b2b8438178dfdd6468f@sentry.io/1377847",
      "dfpAccountId" -> "59666047",
      "discussionApiClientHeader" -> "nextgen",
      "discussionApiUrl" -> "https://discussion.theguardian.com/discussion-api",
      "discussionD2Uid" -> "zHoBy6HNKsk",
      "edition" -> "UK",
      "frontendAssetsFullURL" -> "https://assets.guim.co.uk/",
      "googletagUrl" -> "//securepubads.g.doubleclick.net/tag/js/gpt.js",
      "hbImpl" -> Json.obj(),
      "idApiUrl" -> "https://idapi.theguardian.com",
      "isLive" -> false,
      "isLiveBlog" -> false,
      "isPhotoEssay" -> false,
      "isSensitive" -> false,
      "keywordIds" -> "",
      "pageId" -> "news/2021/apr/26/iran-sentences-nazanin-zaghari-ratcliffe-to-further-one-year-jail-term",
      "revisionNumber" -> "DEV",
      "section" -> "news",
      "sentryHost" -> "app.getsentry.com/35463",
      "sentryPublicApiKey" -> "344003a8d11c41d8800fbad8383fdc50",
      "sharedAdTargeting" -> Json.obj(),
      "shortUrlId" -> "/p/h7pht",
      "showRelatedContent" -> true,
      "stage" -> "PROD",
      "switches" -> Json.obj(),
      "videoDuration" -> 0,
    )
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

    val commercialProperties =
      Map(
        "AU" -> EditionCommercialProperties(None, Set()),
        "INT" -> EditionCommercialProperties(None, Set()),
        "UK" -> EditionCommercialProperties(None, Set()),
        "US" -> EditionCommercialProperties(None, Set()),
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
      pillar = "news",
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
      commercialProperties = commercialProperties,
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
