package model.dotcomponents

import com.gu.contentapi.client.model.v1.ElementType.Text
import com.gu.contentapi.client.model.v1.{Block => APIBlock, BlockElement => ClientBlockElement, Blocks => APIBlocks}
import common.Edition
import common.Maps.RichMap
import common.commercial.{CommercialProperties, EditionCommercialProperties, PrebidIndexSite}
import conf.Configuration.affiliatelinks
import conf.switches.Switches
import conf.{Configuration, Static}
import controllers.ArticlePage
import model.content.Atom
import model.dotcomrendering.pageElements.{DisclaimerBlockElement, PageElement}
import model.{Canonical, LiveBlogPage, PageWithStoryPackage, Pillar, SubMetaLinks}
import navigation.NavMenu
import navigation.ReaderRevenueSite.{Support, SupportContribute, SupportSubscribe}
import navigation.UrlHelpers._
import navigation.{FlatSubnav, NavLink, NavMenu, ParentSubnav, Subnav}
import org.joda.time.DateTime
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.html.fragments.affiliateLinksDisclaimer
import views.support.{AffiliateLinksCleaner, CamelCase, GUDateTimeFormat, ImgSrc, Item300}
import controllers.ArticlePage
import org.joda.time.{DateTime}

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
    lastUpdatedDisplay: Option[String],
    firstPublished: Option[Long],
    firstPublishedDisplay: Option[String],
    title: Option[String],
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
  commercialConfiguration: CommercialConfiguration
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
  ajaxUrl: String,
  sentryPublicApiKey: String,
  sentryHost: String,
  switches: Map[String, Boolean],
  dfpAccountId: String,
  commercialUrl: String,
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
  byline: String,
  twitterHandle: Option[String],
)

object Author {
  implicit val writes = Json.writes[Author]
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

case class DataModelV3(
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
  webURL: String,
  linkedData: List[LinkedData],
  config: Config,
  guardianBaseURL: String,
  contentType: String,
  hasRelated: Boolean,
  hasStoryPackage: Boolean,
  beaconURL: String,
  isCommentable: Boolean,
  commercialProperties: Map[String, EditionCommercialProperties],
  commercialConfiguration: CommercialConfiguration,
  starRating: Option[Int],
  trailText: String,
  nav: Nav,
  designType: String
)

object DataModelV3 {
  implicit val pageElementWrites: Writes[PageElement] = Json.writes[PageElement]

  implicit val writes = new Writes[DataModelV3] {
    def writes(model: DataModelV3) = Json.obj(
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
      "webURL" -> model.webURL,
      "linkedData" -> model.linkedData,
      "config" -> model.config,
      "guardianBaseURL" -> model.guardianBaseURL,
      "contentType" -> model.contentType,
      "hasRelated" -> model.hasRelated,
      "hasStoryPackage" -> model.hasStoryPackage,
      "beaconURL" -> model.beaconURL,
      "isCommentable" -> model.isCommentable,
      "commercialProperties" -> model.commercialProperties,
      "commercialConfiguration" -> model.commercialConfiguration,
      "starRating" -> model.starRating,
      "trailText" -> model.trailText,
      "nav" -> model.nav,
      "designType" -> model.designType
    )
  }

  def toJson(model: DataModelV3): String = {
    def withoutNull(json: JsValue): JsValue = json match {
      case JsObject(fields) => JsObject(fields.filterNot{ case (_, value) => value == JsNull })
      case other => other
    }

    val jsValue = Json.toJson(model)
    Json.stringify(withoutNull(jsValue))
  }
}

object DotcomponentsDataModel {

  val VERSION = 2

  def fromArticle(articlePage: PageWithStoryPackage, request: RequestHeader, blocks: APIBlocks, commercialConfiguration: CommercialConfiguration): DataModelV3 = {

    val article = articlePage.article
    val atoms: Iterable[Atom] = article.content.atoms.map(_.all).getOrElse(Seq())

    // TODO this logic is duplicated from the cleaners, can we consolidate?
    val shouldAddAffiliateLinks = AffiliateLinksCleaner.shouldAddAffiliateLinks(
      switchedOn = Switches.AffiliateLinks.isSwitchedOn,
      section = article.metadata.sectionId,
      showAffiliateLinks =  article.content.fields.showAffiliateLinks,
      supportedSections = affiliatelinks.affiliateLinkSections,
      defaultOffTags = affiliatelinks.defaultOffTags,
      alwaysOffTags = affiliatelinks.alwaysOffTags,
      tagPaths = article.content.tags.tags.map(_.id)
    )

    def toBlock(block: APIBlock, shouldAddAffiliateLinks: Boolean, edition: Edition): Block = {
      def format(instant: Long, edition: Edition): String = {
        GUDateTimeFormat.dateTimeToLiveBlogDisplay(new DateTime(instant), edition.timezone)
      }

      val createdOn = block.createdDate.map(_.dateTime)
      val createdOnDisplay = createdOn.map(dt => format(dt, edition))
      val lastUpdatedDisplay = block.lastModifiedDate.map(dt => format(dt.dateTime, edition))
      val firstPublished = block.firstPublishedDate.orElse(block.createdDate).map(_.dateTime)
      val firstPublishedDisplay = firstPublished.map(dt => format(dt, edition))

      Block(
        id = block.id,
        elements = blocksToPageElements(block.elements, shouldAddAffiliateLinks),
        createdOn = createdOn,
        createdOnDisplay = createdOnDisplay,
        lastUpdatedDisplay = lastUpdatedDisplay,
        title = block.title,
        firstPublished = firstPublished,
        firstPublishedDisplay = firstPublishedDisplay,
      )
    }

    def blocksToPageElements(capiElems: Seq[ClientBlockElement], affiliateLinks: Boolean): List[PageElement] = {
      val elems = capiElems.toList.flatMap(el => PageElement.make(
        element = el,
        addAffiliateLinks = affiliateLinks,
        pageUrl = request.uri,
        atoms = atoms
      )).filter(PageElement.isSupported)

      addDisclaimer(elems, capiElems, affiliateLinks)
    }

    def addDisclaimer(elems: List[PageElement], capiElems: Seq[ClientBlockElement], affiliateLinks: Boolean): List[PageElement] = {
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

    def buildFullCommercialUrl(bundlePath: String): String = {
      // This function exists because for some reasons `Static` behaves differently in { PROD and CODE } versus LOCAL
      if(Configuration.environment.isProd || Configuration.environment.isCode){
        Static(bundlePath)
      } else {
        s"${Configuration.site.host}${Static(bundlePath)}"
      }
    }

    def blocksForLiveblogPage(liveblog: LiveBlogPage, blocks: APIBlocks): Seq[APIBlock] = {
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

    def findPillar(pillar: Pillar, tags: List[Tag]): String = {
      val isPaidContent = tags.exists(tag => tag.`type` == "Tone" && tag.id == "tone/advertisement-features")

      if (isPaidContent) "labs"
      else if (pillar.toString.toLowerCase == "arts") "culture"
      else pillar.toString.toLowerCase()
    }

    val bodyBlocksRaw = articlePage match {
      case lb: LiveBlogPage => blocksForLiveblogPage(lb, blocks)
      case article => blocks.body.getOrElse(Nil)
    }

    val bodyBlocks = bodyBlocksRaw
      .filter(_.published)
      .map(block => toBlock(block, shouldAddAffiliateLinks, Edition(request))).toList

    val pagination = articlePage match {
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
      blocks.main.map(block => toBlock(block, shouldAddAffiliateLinks, Edition(request)))
    }

    val keyEvents: Seq[Block] = {
      blocks.requestedBodyBlocks
        .getOrElse(Map.empty[String, Seq[APIBlock]])
        .getOrElse("body:key-events", Seq.empty[APIBlock])
        .map(block => toBlock(block, shouldAddAffiliateLinks, Edition(request)))
    }

    //val dcBlocks = Blocks(mainBlock, bodyBlocks, keyEvents.toList)

    val jsConfig = (k: String) => articlePage.getJavascriptConfig.get(k).map(_.as[String])

    val jsPageData = Configuration.javascript.pageData mapKeys { key =>
      CamelCase.fromHyphenated(key.split('.').lastOption.getOrElse(""))
    }

    val switches = conf.switches.Switches.all.filter(_.exposeClientSide).foldLeft(Map.empty[String,Boolean])( (acc, switch) => {
      acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
    })

    // See https://developers.google.com/search/docs/data-types/article (and the AMP info too)
    // For example, we need to provide an image of at least 1200px width to be valid here
    val linkedData: List[LinkedData] = {
      articlePage match {
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
      val navMenu = NavMenu(articlePage, Edition(request))
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
      commercialConfiguration
    )

    val byline = article.tags.contributors.map(_.name) match {
      case Nil => article.trail.byline.getOrElse("Guardian staff reporter")
      case contributors => contributors.mkString(",")
    }

    val config = Config(
      ajaxUrl = Configuration.ajax.url,
      sentryPublicApiKey = jsPageData.get("sentryPublicApiKey").getOrElse(""),
      sentryHost = jsPageData.get("sentryHost").getOrElse(""),
      switches = switches,
      dfpAccountId = "", // TODO
      commercialUrl = buildFullCommercialUrl("javascripts/graun.dotcom-rendering-commercial.js"),
    )

    val author = Author(
      byline = byline,
      twitterHandle = article.tags.contributors.headOption.flatMap(_.properties.twitterHandle)
    )

    DataModelV3(
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
      webPublicationDateDisplay = GUDateTimeFormat.formatDateTimeForDisplay(article.trail.webPublicationDate, request),
      editionLongForm = Edition(request).displayName, // TODO check
      editionId = Edition(request).id,
      pageId = article.metadata.id,
      tags = allTags,
      pillar = article.metadata.pillar.map(pillar => findPillar(pillar, allTags)).getOrElse("news"),
      isImmersive = article.isImmersive,
      sectionLabel = article.content.sectionLabelName,
      sectionUrl = article.content.sectionLabelLink,
      sectionName = article.metadata.section.map(_.value),
      subMetaSectionLinks = article.content.submetaLinks.sectionLabels.map(SubMetaLink.apply),
      subMetaKeywordLinks = article.content.submetaLinks.keywords.map(SubMetaLink.apply),
      shouldHideAds = article.content.shouldHideAdverts,
      webURL = article.metadata.webUrl,
      linkedData = linkedData,
      config = config,
      guardianBaseURL = Configuration.site.host,
      contentType = jsConfig("contentType").getOrElse(""),
      hasRelated = article.content.showInRelated,
      hasStoryPackage = articlePage.related.hasStoryPackage,
      beaconURL = Configuration.debug.beaconUrl,
      isCommentable = article.trail.isCommentable,
      commercialProperties = commercial.editionCommercialProperties,
      commercialConfiguration = commercialConfiguration,
      starRating = article.content.starRating,
      trailText = article.trail.fields.trailText.getOrElse(""),
      nav = nav,
      designType = article.metadata.designType.map(_.toString).getOrElse("Article")
    )
  }
}
