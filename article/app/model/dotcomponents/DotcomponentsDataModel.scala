package model.dotcomponents

import com.gu.contentapi.client.model.v1.ElementType.Text
import com.gu.contentapi.client.model.v1.{BlockElement => ClientBlockElement, Blocks => APIBlocks}
import common.Edition
import common.Maps.RichMap
import common.commercial.{CommercialProperties, EditionCommercialProperties, PrebidIndexSite}
import conf.Configuration.affiliatelinks
import conf.switches.Switches
import conf.{Configuration, Static}
import controllers.ArticlePage
import model.content.Atom
import model.{Page, SubMetaLinks}
import model.dotcomrendering.pageElements.{DisclaimerBlockElement, PageElement}
import model.meta._
import navigation.NavMenu
import navigation.ReaderRevenueSite.{Support, SupportContribute, SupportSubscribe}
import navigation.UrlHelpers._
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.html.fragments.affiliateLinksDisclaimer
import views.support.{AffiliateLinksCleaner, CamelCase, FourByThree, GUDateTimeFormat, GoogleAnalyticsAccount, ImgSrc, Item1200, Item300, JavaScriptPage, OneByOne}
import ai.x.play.json.implicits.optionWithNull
import common.Maps.RichMap
import navigation.UrlHelpers.{AmpFooter, AmpHeader}
import navigation.UrlHelpers.{Footer, Header, SideMenu, getReaderRevenueUrl}
import navigation.ReaderRevenueSite.{Support, SupportContribute, SupportSubscribe}
import model.meta.{Guardian, LinkedData, PotentialAction}

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

case class Meta(
  isImmersive: Boolean,
  isHosted: Boolean,
  shouldHideAds: Boolean,
  hasStoryPackage: Boolean,
  hasRelated: Boolean,
  isCommentable: Boolean,
  linkedData: List[LinkedData],
  hasShowcaseMainElement: Boolean,
  isFront: Boolean,
  isLiveblog: Boolean,
  isMinuteArticle: Boolean,
  isPaidContent: Boolean,
  isPreview: Boolean,
  isSensitive: Boolean,
  revisionNumber: String,
  shouldHideReaderRevenue: Boolean,
  showNewRecipeDesign: Boolean,
  showRelatedContent: Boolean
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
  hbImpl: String,
  isHosted: Boolean
)

case class GoogleAnalyticsTrackers(
  editorialTest: String,
  editorialProd: String,
  editorial: String,
)

case class GoogleAnalytics(
  trackers: GoogleAnalyticsTrackers
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
  commercialUrl: String,
  assetsPath: String,
  googleAnalytics: GoogleAnalytics
)

case class DCPage(
  content: Content,
  tags: Tags,
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
  meta: Meta,
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

object GoogleAnalyticsTrackers {
  implicit val writes = Json.writes[GoogleAnalyticsTrackers]
}

object GoogleAnalytics {
  implicit val writes = Json.writes[GoogleAnalytics]
}

object DCPage {
  implicit val writes = Json.writes[DCPage]
}

object DCSite {
  implicit val writes = Json.writes[DCSite]
}

object DotcomponentsDataModel {

  val VERSION = 2

  def fromArticle(articlePage: ArticlePage, request: RequestHeader, blocks: APIBlocks, context: model.ApplicationContext): DotcomponentsDataModel = {

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

    def blocksToPageElements(capiElems: Seq[ClientBlockElement], affiliateLinks: Boolean): List[PageElement] = {
      val elems = capiElems.toList.flatMap(el => PageElement.make(
        element = el,
        addAffiliateLinks = affiliateLinks,
        pageUrl = request.uri,
        atoms = atoms
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

    def buildFullCommercialUrl(bundlePath: String): String = {
      // This function exists because for some reasons `Static` behaves differently in { PROD and CODE } versus LOCAL
      if(Configuration.environment.isProd || Configuration.environment.isCode){
        Static(bundlePath)
      } else {
        s"${Configuration.site.host}${Static(bundlePath)}"
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

    val jsConfig = (k: String) => articlePage.getJavascriptConfig.get(k).map(_.as[String])
    val jsConfigOptionBoolean = (k: String) => articlePage.getJavascriptConfig.get(k).map(_.as[Boolean])

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

    val googleAnalyticsTrackers = GoogleAnalyticsTrackers(
      GoogleAnalyticsAccount.editorialTest.trackerName,
      GoogleAnalyticsAccount.editorialProd.trackerName,
      GoogleAnalyticsAccount.editorialTracker(context).trackerName
    )

    val googleAnalytics = GoogleAnalytics(
      googleAnalyticsTrackers
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
      buildFullCommercialUrl("javascripts/graun.dotcom-rendering-commercial.js"),
      Configuration.assets.path,
      googleAnalytics
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
      JavaScriptPage.getMap(articlePage, Edition(request), false).get("hbImpl").map(_.as[String]).getOrElse("none"),
      JavaScriptPage.getMap(articlePage, Edition(request), false).getOrElse("isHosted", JsBoolean(false)).as[Boolean]
    )

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
      article.tags.contributors.map(_.name).mkString(","),
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
        linkedData,
        jsConfigOptionBoolean("hasShowcaseMainElement").getOrElse(false),
        JavaScriptPage.getMap(articlePage, Edition(request), false).getOrElse("isFront", JsBoolean(false)).as[Boolean],
        JavaScriptPage.getMap(articlePage, Edition(request), false).getOrElse("isLiveBlog", JsBoolean(false)).as[Boolean],
        JavaScriptPage.getMap(articlePage, Edition(request), false).getOrElse("isMinuteArticle", JsBoolean(false)).as[Boolean],
        JavaScriptPage.getMap(articlePage, Edition(request), false).getOrElse("isPaidContent", JsBoolean(false)).as[Boolean],
        context.isPreview,
        JavaScriptPage.getMap(articlePage, Edition(request), false).getOrElse("isSensitive", JsBoolean(false)).as[Boolean],
        JavaScriptPage.getMap(articlePage, Edition(request), false).getOrElse("revisionNumber", JsString("")).as[String],
        JavaScriptPage.getMap(articlePage, Edition(request), false).getOrElse("shouldHideReaderRevenue", JsBoolean(false)).as[Boolean],
        JavaScriptPage.getMap(articlePage, Edition(request), false).getOrElse("showNewRecipeDesign", JsBoolean(false)).as[Boolean],
        jsConfigOptionBoolean("showRelatedContent").getOrElse(false),
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
