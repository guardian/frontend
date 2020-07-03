package model.dotcomponents

import java.net.URLEncoder

import com.gu.contentapi.client.model.v1.ElementType.Text
import com.gu.contentapi.client.model.v1.{Block => APIBlock, BlockElement => ClientBlockElement, Blocks => APIBlocks}
import com.gu.contentapi.client.utils.{AdvertisementFeature, DesignType}
import common.Edition
import common.Maps.RichMap
import common.commercial.{CommercialProperties, EditionCommercialProperties, PrebidIndexSite}
import conf.Configuration.affiliateLinks
import conf.switches.Switches
import conf.{Configuration, Static}
import model.content.Atom
import model.dotcomrendering.pageElements.{DisclaimerBlockElement, PageElement}
import model.{Article, ArticleDateTimes, Badges, Canonical, DisplayedDateTimesDCR, GUDateTimeFormatNew, LiveBlogPage, PageWithStoryPackage, Pillar}
import navigation.ReaderRevenueSite.{Support, SupportContribute, SupportSubscribe}
import navigation.UrlHelpers._
import navigation.{FlatSubnav, NavLink, NavMenu, ParentSubnav, Subnav}
import navigation.{FooterLink, FooterLinks}
import play.api.libs.json._
import play.api.mvc.RequestHeader
import common.RichRequestHeader
import views.html.fragments.affiliateLinksDisclaimer
import views.support.{AffiliateLinksCleaner, CamelCase, ContentLayout, ImgSrc, Item300}
import controllers.ArticlePage
import experiments.ActiveExperiments
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import views.support.JavaScriptPage

// We have introduced our own set of objects for serializing data to the DotComponents API,
// because we don't want people changing the core frontend models and as a side effect,
// making them incompatible with Dotcomponents. By having our own set of models, there's
// only one reason for change.
// exceptions: we do resuse the existing Nav & BlockElement classes right now

case class Tag(
  id: String,
  `type`: String,
  title: String,
  twitterHandle: Option[String],
  bylineImageUrl: Option[String]
)

case class Block(
    id: String,
    elements: List[PageElement],
    createdOn: Option[Long],
    createdOnDisplay: Option[String],
    lastUpdated: Option[Long],
    lastUpdatedDisplay: Option[String],
    firstPublished: Option[Long],
    firstPublishedDisplay: Option[String],
    title: Option[String],
    primaryDateLine: String,
    secondaryDateLine: String
)

case class Pagination(
  currentPage: Int,
  totalPages: Int,
  newest: Option[String],
  newer: Option[String],
  oldest: Option[String],
  older: Option[String],
)

case class ReaderRevenueLink(
  contribute: String,
  subscribe: String,
  support: String
)

case class ReaderRevenueLinks(
  header: ReaderRevenueLink,
  footer: ReaderRevenueLink,
  sideMenu: ReaderRevenueLink,
  ampHeader: ReaderRevenueLink,
  ampFooter: ReaderRevenueLink
)

case class Commercial(
  editionCommercialProperties: Map[String, EditionCommercialProperties],
  prebidIndexSites: List[PrebidIndexSite],
  commercialProperties: Option[CommercialProperties],
  pageType: PageType
)

object Block {
  implicit val blockElementWrites: Writes[PageElement] = Json.writes[PageElement]
  implicit val writes = Json.writes[Block]
}

object Commercial {
  implicit val writes = Json.writes[Commercial]
}

object Tag {
  implicit val writes = Json.writes[Tag]
}

object ReaderRevenueLink {
  implicit val writes = Json.writes[ReaderRevenueLink]
}

object ReaderRevenueLinks {
  implicit val writes = Json.writes[ReaderRevenueLinks]
}

object Pagination {
  implicit val writes = Json.writes[Pagination]
}

case class Config(
  switches: Map[String, Boolean],
  abTests: Map[String, String],
  commercialBundleUrl: String,
  googletagUrl: String,
  stage: String,
  frontendAssetsFullURL: String,
  ampIframeUrl: String,
)

object Config {
  implicit val writes = Json.writes[Config]
}

case class SubMetaLink(
  url: String,
  title: String,
)

object SubMetaLink {
  implicit val format = Json.format[SubMetaLink]

  def apply(sml: model.SubMetaLink): SubMetaLink = {
    SubMetaLink(
      url = sml.link,
      title = sml.text,
    )
  }
}

case class Author(
  byline: Option[String],
  twitterHandle: Option[String],
)

object Author {
  implicit val writes = Json.writes[Author]
}

case class DCRBadge(seriesTag: String, imageUrl: String)

object DCRBadge {
  implicit val writes = Json.writes[DCRBadge]
}

case class Nav(
  currentUrl: String,
  pillars: Seq[NavLink],
  otherLinks: Seq[NavLink],
  brandExtensions: Seq[NavLink],
  currentNavLink: Option[NavLink],
  currentParent: Option[NavLink],
  currentPillar: Option[NavLink],
  subNavSections: Option[Subnav],
  readerRevenueLinks: ReaderRevenueLinks,
)

object Nav {
  implicit val navlinkWrites = Json.writes[NavLink]
  implicit val flatSubnavWrites = Json.writes[FlatSubnav]
  implicit val parentSubnavWrites = Json.writes[ParentSubnav]
  implicit val subnavWrites = Writes[Subnav]{
    case nav: FlatSubnav => flatSubnavWrites.writes(nav)
    case nav: ParentSubnav => parentSubnavWrites.writes(nav)
  }
  implicit val writes = Json.writes[Nav]
}

case class PageFooter(
  footerLinks: Seq[Seq[FooterLink]]
)

object PageFooter {
  implicit val footerLinkWrites: Writes[FooterLink] = Json.writes[FooterLink]
  implicit val writes = Json.writes[PageFooter]
}

// -----------------------------------------------------------------
// DCR DataModel
// -----------------------------------------------------------------

case class DCRDataModel(
  version: Int,
  headline: String,
  standfirst: String,
  webTitle: String,
  mainMediaElements: List[PageElement],
  main: String,
  keyEvents: List[Block],
  blocks: List[Block],
  pagination: Option[Pagination],
  author: Author,
  webPublicationDate: String,
  webPublicationDateDisplay: String, // TODO remove
  editionLongForm: String,
  editionId: String,
  pageId: String,
  tags: List[Tag],
  pillar: String,
  isImmersive: Boolean,
  sectionLabel: String,
  sectionUrl: String,
  sectionName: Option[String],
  subMetaSectionLinks: List[SubMetaLink],
  subMetaKeywordLinks: List[SubMetaLink],
  shouldHideAds: Boolean,
  isAdFreeUser: Boolean,
  webURL: String,
  linkedData: List[LinkedData],
  openGraphData: Map[String, String],
  twitterData: Map[String, String],
  config: JsObject,
  guardianBaseURL: String,
  contentType: String,
  hasRelated: Boolean,
  hasStoryPackage: Boolean,
  beaconURL: String,
  isCommentable: Boolean,
  commercialProperties: Map[String, EditionCommercialProperties],
  pageType: PageType,
  starRating: Option[Int],
  trailText: String,
  nav: Nav,
  designType: String,
  showBottomSocialButtons: Boolean,
  pageFooter: PageFooter,
  publication: String,
  shouldHideReaderRevenue: Boolean,

  // slot machine (temporary for contributions development)
  slotMachineFlags: String,
  contributionsServiceUrl: String,
  badge: Option[DCRBadge],

  // Match Data
  matchUrl: Option[String], // Optional url used for match data
)

object DCRDataModel {

  implicit val pageElementWrites: Writes[PageElement] = Json.writes[PageElement]

  implicit val writes = new Writes[DCRDataModel] {
    def writes(model: DCRDataModel) = Json.obj(
      "version" -> model.version,
      "headline" -> model.headline,
      "standfirst" -> model.standfirst,
      "webTitle" -> model.webTitle,
      "mainMediaElements" -> Json.toJson(model.mainMediaElements),
      "main" -> model.main,
      "keyEvents" -> model.keyEvents,
      "blocks" -> model.blocks,
      "pagination" -> model.pagination,
      "author" -> model.author,
      "webPublicationDate" -> model.webPublicationDate,
      "webPublicationDateDisplay" -> model.webPublicationDateDisplay,
      "editionLongForm" -> model.editionLongForm,
      "editionId" -> model.editionId,
      "pageId" -> model.pageId,
      "tags" -> model.tags,
      "pillar" -> model.pillar,
      "isImmersive" -> model.isImmersive,
      "sectionLabel" -> model.sectionLabel,
      "sectionUrl" -> model.sectionUrl,
      "sectionName" -> model.sectionName,
      "subMetaSectionLinks" -> model.subMetaSectionLinks,
      "subMetaKeywordLinks" -> model.subMetaKeywordLinks,
      "shouldHideAds" -> model.shouldHideAds,
      "isAdFreeUser" -> model.isAdFreeUser,
      "webURL" -> model.webURL,
      "linkedData" -> model.linkedData,
      "openGraphData" -> model.openGraphData,
      "twitterData" -> model.twitterData,
      "config" -> model.config,
      "guardianBaseURL" -> model.guardianBaseURL,
      "contentType" -> model.contentType,
      "hasRelated" -> model.hasRelated,
      "hasStoryPackage" -> model.hasStoryPackage,
      "beaconURL" -> model.beaconURL,
      "isCommentable" -> model.isCommentable,
      "commercialProperties" -> model.commercialProperties,
      "pageType" -> model.pageType,
      "starRating" -> model.starRating,
      "trailText" -> model.trailText,
      "nav" -> model.nav,
      "designType" -> model.designType,
      "showBottomSocialButtons" -> model.showBottomSocialButtons,
      "pageFooter" -> model.pageFooter,
      "publication" -> model.publication,
      "shouldHideReaderRevenue" -> model.shouldHideReaderRevenue,
      "slotMachineFlags" -> model.slotMachineFlags,
      "contributionsServiceUrl" -> model.contributionsServiceUrl,
      "badge" -> model.badge,
      "matchUrl" -> model.matchUrl
    )
  }

  def toJson(model: DCRDataModel): String = {
    def withoutNull(json: JsValue): JsValue = json match {
      case JsObject(fields) => JsObject(fields.filterNot{ case (_, value) => value == JsNull })
      case other => other
    }
    val jsValue = Json.toJson(model)
    Json.stringify(withoutNull(jsValue))
  }
}

object DotcomponentsDataModel {

  private def makeMatchUrl(articlePage: PageWithStoryPackage): Option[String] = {

    def extraction1(references: JsValue): Option[IndexedSeq[JsValue]] = {
      val sequence = references match {
        case JsArray(elements) => Some(elements)
        case _ => None
      }
      sequence
    }

    def entryToDataPair(entry: JsValue): Option[(String, String)] = {
      /*
          Examples:
          {
            "esa-football-team": "/\" + \"football/\" + \"team/\" + \"331"
          }
          {
            "pa-football-competition": "500"
          }
          {
            "pa-football-team": "26305"
          }
       */
      val obj = entry.as[JsObject]
      obj.fields.map(pair => (pair._1, pair._2.as[String])).headOption
    }

    val optionalUrl: Option[String] = for {
      references <- articlePage.getJavascriptConfig.get("references")
      entries1 <- extraction1(references)
      entries2 = entries1
        .map(entryToDataPair(_))
        .filter( _.isDefined )
        .map( _.get ) // .get is fundamentally dangerous but fine in this case because we filtered the Nones out.
        .filter( _._1 == "pa-football-team" )
    } yield {
      val pageId = URLEncoder.encode(articlePage.article.metadata.id, "UTF-8")
      entries2.toList match {
        case e1 :: e2 :: _ => {
          val year = articlePage.article.trail.webPublicationDate.toString(DateTimeFormat.forPattern("yyy"))
          val month = articlePage.article.trail.webPublicationDate.toString(DateTimeFormat.forPattern("MM"))
          val day = articlePage.article.trail.webPublicationDate.toString(DateTimeFormat.forPattern("dd"))
          s"${Configuration.ajax.url}/football/api/match-nav/${year}/${month}/${day}/${e1._2}/${e2._2}.json?dcr=true&page=${pageId}"
        }
        case _ => ""
      }
    }

    // We need one more transformation because we could have a Some(""), which we don't want

    if (optionalUrl.getOrElse("").size>0) {
      optionalUrl
    } else {
      None
    }
  }

  private def designTypeAsString(designType: Option[DesignType]): String = {
    designType.map(_.toString).getOrElse("Article")
  }

  private def buildFullCommercialUrl(bundlePath: String): String = {
    // This function exists because for some reasons `Static` behaves differently in { PROD and CODE } versus LOCAL
    if(Configuration.environment.isProd || Configuration.environment.isCode){
      Static(bundlePath)
    } else {
      s"${Configuration.site.host}${Static(bundlePath)}"
    }
  }

  // note: this is duplicated in the onward service (DotcomponentsOnwardsModels - if duplicating again consider moving to common! :()
  private def findPillar(pillar: Option[Pillar], designType: Option[DesignType]): String = {
    pillar.map { pillar =>
      if (designType == AdvertisementFeature) "labs"
      else if (pillar.toString.toLowerCase == "arts") "culture"
      else pillar.toString.toLowerCase()
    }.getOrElse("news")
  }

  private def blocksForLiveblogPage(liveblog: LiveBlogPage, blocks: APIBlocks): Seq[APIBlock] = {
    val last60 = blocks.requestedBodyBlocks
      .getOrElse(Map.empty[String, Seq[APIBlock]])
      .getOrElse(Canonical.firstPage, Seq.empty[APIBlock])
      .toList

    // For the newest page, the last 60 blocks are requested, but for other page,
    // all of the blocks have been requested and returned in the blocks.body bit
    // of the response so we use those
    val relevantBlocks = if (last60.isEmpty) blocks.body.getOrElse(Nil) else last60

    val ids = liveblog.currentPage.currentPage.blocks.map(_.id).toSet
    relevantBlocks.filter(block => ids(block.id))
  }

  private def addDisclaimer(elems: List[PageElement], capiElems: Seq[ClientBlockElement], affiliateLinks: Boolean): List[PageElement] = {
    if (affiliateLinks) {
      val hasLinks = capiElems.exists(elem => elem.`type` match {
        case Text => {
          val textString = elem.textTypeData.toList.mkString("\n") // just concat all the elems here for this test
          AffiliateLinksCleaner.stringContainsAffiliateableLinks(textString)
        }
        case _ => false
      })

      if (hasLinks) {
        elems :+ DisclaimerBlockElement(affiliateLinksDisclaimer("article").body)
      } else {
        elems
      }
    } else elems
  }

  private def blockElementsToPageElements(capiElems: Seq[ClientBlockElement], request: RequestHeader, article: Article, affiliateLinks: Boolean, isMainBlock: Boolean, isImmersive: Boolean, campaigns: Option[JsValue], calloutsUrl: Option[String]): List[PageElement] = {
    val atoms: Iterable[Atom] = article.content.atoms.map(_.all).getOrElse(Seq())
    val elems = capiElems.toList.flatMap(el => PageElement.make(
      element = el,
      addAffiliateLinks = affiliateLinks,
      pageUrl = request.uri,
      atoms = atoms,
      isMainBlock,
      isImmersive,
      campaigns,
      calloutsUrl
    )).filter(PageElement.isSupported)
    addDisclaimer(elems, capiElems, affiliateLinks)
  }

  private def toBlock(block: APIBlock, page: PageWithStoryPackage, shouldAddAffiliateLinks: Boolean, request: RequestHeader, isMainBlock: Boolean, isImmersive: Boolean, articleDateTimes: ArticleDateTimes): Block = {

    val article = page.article

    // For createdOn and createdOnDisplay we are going to carry on use the block information
    // I am not sure they are used on DCR and I do not seem to be able to find them as article metadata
    // Todo: Check whether they are used on DCR or not and if not remove them from the model
    val createdOn = block.createdDate.map(_.dateTime)
    val createdOnDisplay = createdOn.map(dt => GUDateTimeFormatNew.formatTimeForDisplay(new DateTime(dt), request))

    // last updated (in both versions) and first published (in both versions) are going to
    // be computed from the article metadata.
    // For this we introduced ArticleDateTimes in DatesAndTimes.
    // This is meant to ensure that DCP and DCR use the same dates.
    val displayedDateTimes: DisplayedDateTimesDCR = ArticleDateTimes.makeDisplayedDateTimesDCR(articleDateTimes, request)
    val campaigns = page.getJavascriptConfig.get("campaigns")
    val calloutsUrl: Option[String] = page.getJavascriptConfig.get("calloutsUrl").flatMap(_.asOpt[String])

    Block(
      id = block.id,
      elements = blockElementsToPageElements(block.elements, request, article, shouldAddAffiliateLinks, isMainBlock, isImmersive, campaigns, calloutsUrl),
      createdOn = createdOn,
      createdOnDisplay = createdOnDisplay,
      lastUpdated = Some(displayedDateTimes.lastUpdated),
      lastUpdatedDisplay = Some(displayedDateTimes.lastUpdatedDisplay),
      title = block.title,
      firstPublished = Some(displayedDateTimes.firstPublished),
      firstPublishedDisplay = Some(displayedDateTimes.firstPublishedDisplay),
      primaryDateLine = displayedDateTimes.primaryDateLine,
      secondaryDateLine = displayedDateTimes.secondaryDateLine
    )
  }

  // -----------------------------------------------------------------------

  def fromArticle(page: PageWithStoryPackage, request: RequestHeader, blocks: APIBlocks, pageType: PageType): DCRDataModel = {

    val article = page.article

    // TODO this logic is duplicated from the cleaners, can we consolidate?
    val shouldAddAffiliateLinks = AffiliateLinksCleaner.shouldAddAffiliateLinks(
      switchedOn = Switches.AffiliateLinks.isSwitchedOn,
      section = article.metadata.sectionId,
      showAffiliateLinks =  article.content.fields.showAffiliateLinks,
      supportedSections = affiliateLinks.affiliateLinkSections,
      defaultOffTags = affiliateLinks.defaultOffTags,
      alwaysOffTags = affiliateLinks.alwaysOffTags,
      tagPaths = article.content.tags.tags.map(_.id)
    )

    val bodyBlocksRaw = page match {
      case lb: LiveBlogPage => blocksForLiveblogPage(lb, blocks)
      case article => blocks.body.getOrElse(Nil)
    }

    val articleDateTimes = ArticleDateTimes(
      webPublicationDate = article.trail.webPublicationDate,
      firstPublicationDate = article.fields.firstPublicationDate,
      hasBeenModified = article.content.hasBeenModified,
      lastModificationDate = article.fields.lastModified
    )

    val bodyBlocks = bodyBlocksRaw
      .filter(_.published)
      .map(block => toBlock(block, page, shouldAddAffiliateLinks, request, false, article.isImmersive, articleDateTimes)).toList

    val pagination = page match {
      case liveblog: LiveBlogPage => liveblog.currentPage.pagination.map(paginationInfo => {
        Pagination(
          currentPage = liveblog.currentPage.currentPage.pageNumber,
          totalPages = paginationInfo.numberOfPages,
          newest = paginationInfo.newest.map(_.suffix),
          newer = paginationInfo.newer.map(_.suffix),
          oldest = paginationInfo.oldest.map(_.suffix),
          older = paginationInfo.older.map(_.suffix),
        )
      })
      case _ => None
    }

    val mainBlock: Option[Block] = {
      blocks.main.map(block => toBlock(block, page, shouldAddAffiliateLinks, request, true, article.isImmersive, articleDateTimes))
    }

    val keyEvents: Seq[Block] = {
      blocks.requestedBodyBlocks
        .getOrElse(Map.empty[String, Seq[APIBlock]])
        .getOrElse("body:key-events", Seq.empty[APIBlock])
        .map(block => toBlock(block, page, shouldAddAffiliateLinks, request, false, article.isImmersive, articleDateTimes))
    }

    val jsConfig = (k: String) => page.getJavascriptConfig.get(k).map(_.as[String])

    val switches = conf.switches.Switches.all.filter(_.exposeClientSide).foldLeft(Map.empty[String,Boolean])( (acc, switch) => {
      acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
    })

    // See https://developers.google.com/search/docs/data-types/article (and the AMP info too)
    // For example, we need to provide an image of at least 1200px width to be valid here
    val linkedData: List[LinkedData] = {
      page match {
        case liveblog: LiveBlogPage => LinkedData.forLiveblog(
          liveblog = liveblog,
          blocks = bodyBlocksRaw,
          baseURL = Configuration.amp.baseUrl,
          fallbackLogo = Configuration.images.fallbackLogo
        )
        case regular: ArticlePage => LinkedData.forArticle(
          article = regular.article,
          baseURL = Configuration.amp.baseUrl,
          fallbackLogo = Configuration.images.fallbackLogo
        )
      }
    }

    val openGraphData: Map[String, String] = page.getOpenGraphProperties;
    val twitterData: Map[String, String] = page.getTwitterProperties

    val allTags = article.tags.tags.map(
      t => Tag(
        t.id,
        t.properties.tagType,
        t.properties.webTitle,
        t.properties.twitterHandle,
        t.properties.contributorLargeImagePath.map(src => ImgSrc(src, Item300))
      )
    )

    val headerReaderRevenueLink: ReaderRevenueLink = ReaderRevenueLink(
      getReaderRevenueUrl(SupportContribute, Header)(request),
      getReaderRevenueUrl(SupportSubscribe, Header)(request),
      getReaderRevenueUrl(Support, Header)(request)
    )

    val footerReaderRevenueLink: ReaderRevenueLink = ReaderRevenueLink(
      getReaderRevenueUrl(SupportContribute, Footer)(request),
      getReaderRevenueUrl(SupportSubscribe, Footer)(request),
      getReaderRevenueUrl(Support, Footer)(request)
    )

    val sideMenuReaderRevenueLink: ReaderRevenueLink = ReaderRevenueLink(
      getReaderRevenueUrl(SupportContribute, SideMenu)(request),
      getReaderRevenueUrl(SupportSubscribe, SideMenu)(request),
      getReaderRevenueUrl(Support, SideMenu)(request)
    )

    val ampHeaderReaderRevenueLink: ReaderRevenueLink = ReaderRevenueLink(
      getReaderRevenueUrl(SupportContribute, AmpHeader)(request),
      getReaderRevenueUrl(SupportSubscribe, AmpHeader)(request),
      getReaderRevenueUrl(Support, AmpHeader)(request)
    )

    val ampFooterReaderRevenueLink: ReaderRevenueLink = ReaderRevenueLink(
      getReaderRevenueUrl(SupportContribute, AmpFooter)(request),
      getReaderRevenueUrl(SupportSubscribe, AmpFooter)(request),
      getReaderRevenueUrl(Support, AmpFooter)(request)
    )

    val readerRevenueLinks = ReaderRevenueLinks(
      headerReaderRevenueLink,
      footerReaderRevenueLink,
      sideMenuReaderRevenueLink,
      ampHeaderReaderRevenueLink,
      ampFooterReaderRevenueLink
    )

    val nav = {
      val navMenu = NavMenu(page, Edition(request))
      Nav(
        currentUrl = navMenu.currentUrl,
        pillars = navMenu.pillars,
        otherLinks = navMenu.otherLinks,
        brandExtensions = navMenu.brandExtensions,
        currentNavLink = navMenu.currentNavLink,
        currentParent = navMenu.currentParent,
        currentPillar = navMenu.currentPillar,
        subNavSections = navMenu.subNavSections,
        readerRevenueLinks = readerRevenueLinks,
      )
    }

    val commercial = Commercial(
      editionCommercialProperties =
        article.metadata.commercial.map{_.perEdition.mapKeys(_.id)}
          .getOrElse(Map.empty[String,EditionCommercialProperties]),
      prebidIndexSites = (for {
        commercial <- article.metadata.commercial
        sites <- commercial.prebidIndexSites
      } yield sites.toList).getOrElse(List()),
      article.metadata.commercial,
      pageType
    )

    val byline = article.trail.byline

    val config = Config(
      switches = switches,
      abTests = ActiveExperiments.getJsMap(request),
      commercialBundleUrl = buildFullCommercialUrl("javascripts/graun.commercial.dcr.js"),
      ampIframeUrl = buildFullCommercialUrl("data/vendor/amp-iframe.html"),
      googletagUrl = Configuration.googletag.jsLocation,
      stage = common.Environment.stage,
      frontendAssetsFullURL = Configuration.assets.fullURL(common.Environment.stage)
    )

    val jsPageConfig = JavaScriptPage.getMap(page, Edition(request), false)
    val combinedConfig = Json.toJsObject(config).deepMerge(JsObject(jsPageConfig))

    val author = Author(
      byline = byline,
      twitterHandle = article.tags.contributors.headOption.flatMap(_.properties.twitterHandle)
    )

    val badge = Badges.badgeFor(article).map(badge =>
      DCRBadge(
        badge.seriesTag,
        badge.imageUrl
      )
    )

    val pageFooter = PageFooter(
      FooterLinks.getFooterByEdition(Edition(request))
    )

    val isPaidContent = article.metadata.designType.contains(AdvertisementFeature)

    DCRDataModel(
      version = 3,
      headline = article.trail.headline,
      standfirst = article.fields.standfirst.getOrElse(""),
      webTitle = article.metadata.webTitle,
      mainMediaElements = mainBlock.toList.flatMap(_.elements),
      main = article.fields.main,
      keyEvents = keyEvents.toList,
      blocks = bodyBlocks,
      pagination = pagination,
      author = author,
      webPublicationDate = article.trail.webPublicationDate.toString, // TODO check format
      webPublicationDateDisplay = GUDateTimeFormatNew.formatDateTimeForDisplay(article.trail.webPublicationDate, request),
      editionLongForm = Edition(request).displayName, // TODO check
      editionId = Edition(request).id,
      pageId = article.metadata.id,
      tags = allTags,
      pillar = findPillar(article.metadata.pillar, article.metadata.designType),
      isImmersive = article.isImmersive,
      sectionLabel = article.content.sectionLabelName,
      sectionUrl = article.content.sectionLabelLink,
      sectionName = article.metadata.section.map(_.value),
      subMetaSectionLinks = article.content.submetaLinks.sectionLabels.map(SubMetaLink.apply),
      subMetaKeywordLinks = article.content.submetaLinks.keywords.map(SubMetaLink.apply),
      shouldHideAds = article.content.shouldHideAdverts,
      isAdFreeUser = views.support.Commercial.isAdFree(request),
      webURL = article.metadata.webUrl,
      linkedData = linkedData,
      openGraphData = openGraphData,
      twitterData = twitterData,
      config = combinedConfig,
      guardianBaseURL = Configuration.site.host,
      contentType = jsConfig("contentType").getOrElse(""),
      hasRelated = article.content.showInRelated,
      hasStoryPackage = page.related.hasStoryPackage,
      beaconURL = Configuration.debug.beaconUrl,
      isCommentable = article.trail.isCommentable,
      commercialProperties = commercial.editionCommercialProperties,
      pageType = pageType,
      starRating = article.content.starRating,
      trailText = article.trail.fields.trailText.getOrElse(""),
      nav = nav,
      showBottomSocialButtons = ContentLayout.showBottomSocialButtons(article),
      designType = designTypeAsString(article.metadata.designType),
      pageFooter = pageFooter,
      publication = article.content.publication,

      // See pageShouldHideReaderRevenue in contributions-utilities.js
      shouldHideReaderRevenue = article.fields.shouldHideReaderRevenue
        .getOrElse(isPaidContent),

      slotMachineFlags = request.slotMachineFlags,
      contributionsServiceUrl = Configuration.contributionsService.url,
      badge = badge,

      // Match Data
      matchUrl = makeMatchUrl(page)
    )
  }
}
