package model.dotcomponents

import com.gu.contentapi.client.model.v1.ElementType.Text
import com.gu.contentapi.client.model.v1.{Block => APIBlock, BlockElement => ClientBlockElement, Blocks => APIBlocks}
import common.Edition
import common.Maps.RichMap
import common.commercial.{CommercialProperties, EditionCommercialProperties, PrebidIndexSite}
import conf.Configuration.affiliatelinks
import conf.switches.Switches
import conf.{Configuration, Static}
import model.content.Atom
import model.dotcomrendering.pageElements.{DisclaimerBlockElement, PageElement}
import model.{Article, Canonical, LiveBlogPage, PageWithStoryPackage, SubMetaLinks}
import navigation.NavMenu
import navigation.ReaderRevenueSite.{Support, SupportContribute, SupportSubscribe}
import navigation.UrlHelpers._
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.html.fragments.affiliateLinksDisclaimer
import views.support.{AffiliateLinksCleaner, CamelCase, GUDateTimeFormat, ImgSrc, Item300}
import ai.x.play.json.implicits.optionWithNull
import controllers.ArticlePage
import org.joda.time.{DateTime, DateTimeZone}


// We have introduced our own set of objects for serializing data to the DotComponents API,
// because we don't want people changing the core frontend models and as a side effect,
// making them incompatible with Dotcomponents. By having our own set of models, there's
// only one reason for change.
// exceptions: we do resuse the existing Nav & BlockElement classes right now

case class TagProperties(
    id: String,
    tagType: String,
    webTitle: String,
    twitterHandle: Option[String],
    bylineImageUrl: Option[String]
)

case class Tag(
    properties: TagProperties
)

case class Block(
    id: String,
    bodyHtml: String,
    elements: List[PageElement],
    createdOn: Option[Long],
    createdOnDisplay: Option[String],
    lastUpdatedDisplay: Option[String],
    firstPublished: Option[Long],
    firstPublishedDisplay: Option[String],
    title: Option[String],
)

case class Blocks(
    main: Option[Block],
    body: List[Block],
    keyEvents: List[Block],
)

// For liveblogs
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

case class Meta(
  isImmersive: Boolean,
  isHosted: Boolean,
  shouldHideAds: Boolean,
  hasStoryPackage: Boolean,
  hasRelated: Boolean,
  isCommentable: Boolean,
  linkedData: List[LinkedData]
)

case class Tags(
  authorIds: Option[String],
  toneIds: Option[String],
  keywordIds: Option[String],
  commissioningDesks: Option[String],
  all: List[Tag]
)

case class Content(
  headline: String,
  standfirst: Option[String],
  main: String,
  body: String,
  blocks: Blocks,
  byline: String,
  trailText: String
)

case class Commercial(
  editionCommercialProperties: Map[String, EditionCommercialProperties],
  prebidIndexSites: List[PrebidIndexSite],
  commercialProperties: Option[CommercialProperties], //DEPRECATED TO DELETE
)

// top-level structures

case class DCSite(
  ajaxUrl: String,
  guardianBaseURL: String,
  sentryHost: Option[String],
  sentryPublicApiKey: Option[String],
  switches: Map[String,Boolean],
  beaconUrl: String,
  subscribeWithGoogleApiUrl: String,
  nav: NavMenu,
  readerRevenueLinks: ReaderRevenueLinks,
  commercialUrl: String
)

case class DCPage(
  content: Content,
  tags: Tags,
  pagination: Option[Pagination],
  author: String,
  pageId: String,
  pillar: Option[String],
  webPublicationDate: Long,
  webPublicationDateDisplay: String,
  section: Option[String],
  sectionLabel: String,
  sectionUrl: String,
  webTitle: String,
  contentId: Option[String],
  seriesId: Option[String],
  editionId: String,
  edition: String,
  contentType: Option[String],
  subMetaLinks: SubMetaLinks,
  webURL: String,
  starRating: Option[Int],
  commercial: Commercial,
  meta: Meta
)

// the composite data model

case class DotcomponentsDataModel(
  page: DCPage,
  site: DCSite,
  version: Int
)

object Block {
  implicit val blockElementWrites: Writes[PageElement] = Json.writes[PageElement]
  implicit val writes = Json.writes[Block]
}

object Commercial {
  implicit val writes = Json.writes[Commercial]
}

object Blocks {
  implicit val writes = Json.writes[Blocks]
}

object TagProperties {
  implicit val writes = Json.writes[TagProperties]
}

object Content {
  implicit val writes = Json.writes[Content]
}

object Tag {
  implicit val writes = Json.writes[Tag]
}

object Tags {
  implicit val writes = Json.writes[Tags]
}

object Meta {
  implicit val writes = Json.writes[Meta]
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

object DCPage {
  implicit val writes = Json.writes[DCPage]
}

object DCSite {
  implicit val writes = Json.writes[DCSite]
}

object DotcomponentsDataModel {

  val VERSION = 2

  def fromArticle(articlePage: PageWithStoryPackage, request: RequestHeader, blocks: APIBlocks): DotcomponentsDataModel = {

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
        bodyHtml = block.bodyHtml,
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
      ))

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

    val dcBlocks = Blocks(mainBlock, bodyBlocks, keyEvents.toList)

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
        TagProperties(
          t.id,
          t.properties.tagType,
          t.properties.webTitle,
          t.properties.twitterHandle,
          t.properties.contributorLargeImagePath.map(src => ImgSrc(src, Item300))
        )
      )
    )

    val navMenu = NavMenu(articlePage, Edition(request))

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

    val site = DCSite(
      Configuration.ajax.url,
      Configuration.site.host,
      jsPageData.get("sentryHost"),
      jsPageData.get("sentryPublicApiKey"),
      switches,
      Configuration.debug.beaconUrl,
      Configuration.google.subscribeWithGoogleApiUrl,
      navMenu,
      readerRevenueLinks,
      buildFullCommercialUrl("javascripts/graun.dotcom-rendering-commercial.js")
    )

    val tags = Tags(
      jsConfig("authorIds"),
      jsConfig("keywordIds"),
      jsConfig("toneIds"),
      jsConfig("commissioningDesks"),
      allTags
    )

    val commercial = Commercial(
      editionCommercialProperties =
        article.metadata.commercial.map{_.perEdition.mapKeys(_.id)}
          .getOrElse(Map.empty[String,EditionCommercialProperties]),
      prebidIndexSites = (for {
        commercial <- article.metadata.commercial
        sites <- commercial.prebidIndexSites
      } yield sites.toList).getOrElse(List()),
      article.metadata.commercial,
    )

    val author = article.tags.contributors.map(_.name) match {
      case Nil => "Guardian staff reporter"
      case contributors => contributors.mkString(","),
    }

    val content = DCPage(
      Content(
        article.trail.headline,
        article.fields.standfirst,
        article.fields.main,
        article.fields.body,
        dcBlocks,
        article.trail.byline.getOrElse(""),
        trailText = article.trail.fields.trailText.getOrElse("")
      ),
      tags,
      pagination = pagination,
      author,
      article.metadata.id,
      article.metadata.pillar.map(_.toString),
      article.trail.webPublicationDate.getMillis,
      GUDateTimeFormat.formatDateTimeForDisplay(article.trail.webPublicationDate, request),
      article.metadata.section.map(_.value),
      article.content.sectionLabelName,
      article.content.sectionLabelLink,
      article.metadata.webTitle,
      jsConfig("contentId"),   // source: content.scala
      jsConfig("seriesId"),    // source: content.scala
      Edition(request).id,
      Edition(request).displayName,
      jsConfig("contentType"),
      article.content.submetaLinks,
      article.metadata.webUrl,
      article.content.starRating,
      commercial,
      meta = Meta (
        article.isImmersive,
        article.metadata.isHosted,
        article.content.shouldHideAdverts,
        articlePage.related.hasStoryPackage,
        article.content.showInRelated,
        article.trail.isCommentable,
        linkedData
      ),
    )

    DotcomponentsDataModel(
      content,
      site,
      VERSION
    )

  }

  def toJson(model: DotcomponentsDataModel): JsValue = {
    // make what we have look a bit closer to what dotcomponents currently expects
    implicit val DotComponentsDataModelWrites = new Writes[DotcomponentsDataModel] {
      def writes(model: DotcomponentsDataModel) = Json.obj(
        "page" -> model.page,
        "site" -> model.site,
        "version" -> model.version
      )
    }
    Json.toJson(model)
  }

  def toJsonString(model: DotcomponentsDataModel): String = {
    Json.stringify(toJson(model))
  }
}
