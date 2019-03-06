package model.dotcomponents

import ai.x.play.json.Jsonx
import com.gu.contentapi.client.model.v1.ElementType.Text
import com.gu.contentapi.client.model.v1.{BlockElement => ClientBlockElement, Blocks => APIBlocks}
import common.Edition
import common.Maps.RichMap
import common.commercial.{CommercialProperties, EditionCommercialProperties, PrebidIndexSite}
import conf.Configuration
import conf.Configuration.affiliatelinks
import conf.switches.Switches
import controllers.ArticlePage
import model.SubMetaLinks
import model.dotcomrendering.pageElements.{DisclaimerBlockElement, PageElement}
import model.meta._
import navigation.NavMenu
import navigation.ReaderRevenueSite.{Support, SupportContribute, SupportSubscribe}
import navigation.UrlHelpers._
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.html.fragments.affiliateLinksDisclaimer
import views.support.{AffiliateLinksCleaner, CamelCase, FourByThree, GUDateTimeFormat, ImgSrc, Item1200, OneByOne} // Note, required despite Intellij saying otherwise

// We have introduced our own set of objects for serializing data to the DotComponents API,
// because we don't want people changing the core frontend models and as a side effect,
// making them incompatible with Dotcomponents. By having our own set of models, there's
// only one reason for change.
// exceptions: we do resuse the existing Nav & BlockElement classes right now

case class TagProperties(
    id: String,
    tagType: String,
    webTitle: String,
    twitterHandle: Option[String]
)
case class Tag(
    properties: TagProperties
)

case class Block(
    bodyHtml: String,
    elements: List[PageElement]
)

case class Blocks(
    main: Option[Block],
    body: List[Block]
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

case class PageData(
    author: String,
    pageId: String,
    pillar: Option[String],
    ajaxUrl: String,
    webPublicationDate: Long,
    webPublicationDateDisplay: String,
    section: Option[String],
    sectionLabel: String,
    sectionUrl: String,
    headline: String,
    webTitle: String,
    byline: String,
    contentId: Option[String],
    authorIds: Option[String],
    keywordIds: Option[String],
    toneIds: Option[String],
    seriesId: Option[String],
    isHosted: Boolean,
    beaconUrl: String,
    editionId: String,
    edition: String,
    contentType: Option[String],
    commissioningDesks: Option[String],
    subMetaLinks: SubMetaLinks,
    sentryHost: String,
    sentryPublicApiKey: String,
    switches: Map[String,Boolean],
    linkedData: List[LinkedData],
    subscribeWithGoogleApiUrl: String,

    // AMP specific
    guardianBaseURL: String,
    webURL: String,
    shouldHideAds: Boolean,
    hasStoryPackage: Boolean,
    hasRelated: Boolean,
    isCommentable: Boolean,
    editionCommercialProperties: Map[String, EditionCommercialProperties],
    prebidIndexSites: List[PrebidIndexSite],
    commercialProperties: Option[CommercialProperties], //DEPRECATED TO DELETE
    starRating: Option[Int],
    trailText: String,
)

case class Config(
    isImmersive: Boolean,
    page: PageData,
    nav: NavMenu,
    readerRevenueLinks: ReaderRevenueLinks
)

case class ContentFields(
    standfirst: Option[String],
    main: String,
    body: String,
    blocks: Blocks
)

case class DotcomponentsDataModel(
    contentFields: ContentFields,
    config: Config,
    tags: List[Tag],
    version: Int
)

object Block {
  implicit val blockElementWrites: Writes[PageElement] = Json.writes[PageElement]
  implicit val writes = Json.writes[Block]
}

object Blocks {
  implicit val writes = Json.writes[Blocks]
}

object ContentFields {
  implicit val writes = Json.writes[ContentFields]
}

object TagProperties {
  implicit val writes = Json.writes[TagProperties]
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

object PageData {
  // We use Jsonx here because PageData exceeds 22 fields and
  // regular Play JSON is unable to serialise this. See, e.g.
  //
  // * https://github.com/playframework/play-json/issues/3
  // * https://stackoverflow.com/questions/23571677/22-fields-limit-in-scala-2-11-play-framework-2-3-case-classes-and-functions/23588132#23588132
  implicit val formats = Jsonx.formatCaseClass[PageData]
}

object Config {
  implicit val writes = Json.writes[Config]
}

object DotcomponentsDataModel {

  val VERSION = 1

  def fromArticle(articlePage: ArticlePage, request: RequestHeader, blocks: APIBlocks): DotcomponentsDataModel = {

    val article = articlePage.article

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

    def blocksToPageElements(capiElems: Seq[ClientBlockElement], affiliateLinks: Boolean): List[PageElement] = {
      val elems = capiElems.toList.flatMap(el => PageElement.make(
        element = el,
        addAffiliateLinks = affiliateLinks,
        pageUrl = request.uri
      ))

      addDisclaimer(elems, capiElems)
    }

    def addDisclaimer(elems: List[PageElement], capiElems: Seq[ClientBlockElement]): List[PageElement] = {
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
    }

    val bodyBlocks: List[Block] = {
      val bodyBlocks = blocks.body.getOrElse(Nil)
      bodyBlocks.map(block => Block(block.bodyHtml, blocksToPageElements(block.elements, shouldAddAffiliateLinks))).toList
    }

    val mainBlock: Option[Block] = {
      blocks.main.map(block => Block(block.bodyHtml, blocksToPageElements(block.elements, shouldAddAffiliateLinks)))
    }

    val dcBlocks = Blocks(mainBlock, bodyBlocks)

    val contentFields = ContentFields(
      article.fields.standfirst,
      article.fields.main,
      article.fields.body,
      dcBlocks
    )

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
      val mainImageURL = {
        val main = for {
          elem <- article.trail.trailPicture
          master <- elem.masterImage
          url <- master.url
        } yield url

        main.getOrElse(Configuration.images.fallbackLogo)
      }

      val authors = article.tags.contributors.map(contributor => {
        Person(
          name = contributor.name,
          sameAs = contributor.metadata.webUrl,
        )
      })

      List(
        NewsArticle(
          `@id` = Configuration.amp.baseUrl + article.metadata.id,
          images = Seq(
            ImgSrc(mainImageURL, OneByOne),
            ImgSrc(mainImageURL, FourByThree),
            ImgSrc(mainImageURL, Item1200),
          ),
          author = authors,
          datePublished = article.trail.webPublicationDate.toString(),
          dateModified = article.fields.lastModified.toString(),
          headline = article.trail.headline,
          mainEntityOfPage = article.metadata.webUrl,
        ),
        WebPage(
          `@id` = article.metadata.webUrl,
          potentialAction = PotentialAction(target = "android-app://com.guardian/" + article.metadata.webUrl.replace("://", "/"))
        )
      )
    }

    val pageData = PageData(
      article.tags.contributors.map(_.name).mkString(","),
      article.metadata.id,
      article.metadata.pillar.map(_.toString),
      Configuration.ajax.url,
      article.trail.webPublicationDate.getMillis,
      GUDateTimeFormat.formatDateTimeForDisplay(article.trail.webPublicationDate, request),
      article.metadata.section.map(_.value),
      article.content.sectionLabelName,
      article.content.sectionLabelLink,
      article.trail.headline,
      article.metadata.webTitle,
      article.trail.byline.getOrElse(""),
      jsConfig("contentId"),   // source: content.scala
      jsConfig("authorIds"),   // source: meta.scala
      jsConfig("keywordIds"),  // source: tags.scala and meta.scala
      jsConfig("toneIds"),     // source: meta.scala
      jsConfig("seriesId"),    // source: content.scala
      article.metadata.isHosted,
      Configuration.debug.beaconUrl,
      Edition(request).id,
      Edition(request).displayName,
      jsConfig("contentType"),
      jsConfig("commissioningDesks"),
      article.content.submetaLinks,
      Configuration.rendering.sentryHost,
      Configuration.rendering.sentryPublicApiKey,
      switches,
      linkedData,
      Configuration.google.subscribeWithGoogleApiUrl,
      guardianBaseURL = Configuration.site.host,
      webURL = article.metadata.webUrl,
      shouldHideAds = article.content.shouldHideAdverts,
      hasStoryPackage = articlePage.related.hasStoryPackage,
      hasRelated = article.content.showInRelated,
      isCommentable = article.trail.isCommentable,
      editionCommercialProperties = article.metadata.commercial
        .map(_.perEdition.mapKeys(_.id))
        .getOrElse(Map.empty[String,EditionCommercialProperties]),

      prebidIndexSites = (for {
        commercial <- article.metadata.commercial
        sites <- commercial.prebidIndexSites
      } yield sites.toList).getOrElse(List()),


      commercialProperties = article.metadata.commercial,
      starRating = article.content.starRating,
      trailText = article.trail.fields.trailText.getOrElse("")
    )

    val tags = article.tags.tags.map(
      t => Tag(
        TagProperties(
          t.id,
          t.properties.tagType,
          t.properties.webTitle,
          t.properties.twitterHandle
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

    val config = Config(
      article.isImmersive,
      pageData,
      navMenu,
      readerRevenueLinks
    )

    DotcomponentsDataModel(
      contentFields,
      config,
      tags,
      VERSION
    )

  }

  def toJson(model: DotcomponentsDataModel): JsValue = {

    // make what we have look a bit closer to what dotcomponents currently expects

    implicit val DotComponentsDataModelWrites = new Writes[DotcomponentsDataModel] {
      def writes(model: DotcomponentsDataModel) = Json.obj(
        "config" -> model.config,
        "contentFields" -> Json.obj(
          "fields" -> model.contentFields
        ),
        "tags" -> Json.obj(
          "tags" -> model.tags
        ),
        "version" -> model.version
      )
    }

    Json.toJson(model)

  }


  def toJsonString(model: DotcomponentsDataModel): String = {
    Json.stringify(toJson(model))
  }

}
