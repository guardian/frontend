package model.dotcomrendering

import com.github.nscala_time.time.Imports.DateTime
import com.gu.contentapi.client.model.v1.{Block => APIBlock, BlockElement => ClientBlockElement, Blocks => APIBlocks}
import com.gu.contentapi.client.utils.format.{ImmersiveDisplay, LiveBlogDesign}
import com.gu.contentapi.client.utils.{AdvertisementFeature, DesignType}
import common.Edition
import conf.switches.Switches
import conf.{Configuration, Static}
import model.content.Atom
import model.dotcomrendering.pageElements.{PageElement, TextCleaner}
import model.meta.BlocksOn
import model.pressed.{PressedContent, SpecialReport}
import model.{
  ArticleDateTimes,
  CanonicalLiveBlog,
  ContentFormat,
  ContentPage,
  ContentType,
  GUDateTimeFormatNew,
  LiveBlogPage,
  Pillar,
}
import org.joda.time.{DateTimeZone, Instant, LocalDate, LocalTime}
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import org.jsoup.Jsoup
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.support.AffiliateLinksCleaner

import java.net.URLEncoder

sealed trait DotcomRenderingMatchType

object DotcomRenderingMatchType {
  implicit val matchTypesWrites: Writes[DotcomRenderingMatchType] = (matchType: DotcomRenderingMatchType) =>
    JsString(matchType.toString)
}

case object CricketMatchType extends DotcomRenderingMatchType
case object FootballMatchType extends DotcomRenderingMatchType

case class DotcomRenderingMatchData(
    matchUrl: String,
    matchHeaderUrl: Option[String],
    matchStatsUrl: Option[String],
    matchType: DotcomRenderingMatchType,
)

object DotcomRenderingUtils {
  def makeMatchData(articlePage: ContentPage): Option[DotcomRenderingMatchData] = {
    makeFootballMatch(articlePage).orElse(makeCricketMatch(articlePage))
  }

  def makeCricketMatch(articlePage: ContentPage): Option[DotcomRenderingMatchData] = {
    val cricketDate = articlePage.item.content.cricketMatchDate
    val cricketTeam = articlePage.item.content.cricketTeam

    (cricketDate, cricketTeam) match {
      case (Some(date), Some(team)) =>
        Some(
          DotcomRenderingMatchData(
            matchUrl = s"${Configuration.ajax.url}/sport/cricket/match-scoreboard/$date/${team}.json",
            matchHeaderUrl = None,
            matchStatsUrl = None,
            matchType = CricketMatchType,
          ),
        )
      case _ => None
    }
  }

  def getMatchNavUrl(host: String, date: LocalDate, team1: String, team2: String, pageId: String): String = {
    val formatter = DateTimeFormat.forPattern("yyyy/MM/dd")
    val datePath = formatter.print(date)
    val encodedPageId = URLEncoder.encode(pageId, "UTF-8")
    s"$host/football/api/match-nav/$datePath/$team1/$team2.json?dcr=true&page=$encodedPageId"
  }

  def getMatchHeaderUrl(host: String, date: LocalDate, team1: String, team2: String): String = {
    val formatter = DateTimeFormat.forPattern("yyyy/MM/dd")
    val datePath = formatter.print(date)
    s"$host/football/api/match-header/$datePath/$team1/$team2.json"
  }

  def getMatchStatsUrl(host: String, date: LocalDate, team1: String, team2: String): String = {
    val formatter = DateTimeFormat.forPattern("yyyy/MM/dd")
    val datePath = formatter.print(date)
    s"$host/football/api/match-stats/$datePath/$team1/$team2.json"
  }

  def makeFootballMatch(articlePage: ContentPage): Option[DotcomRenderingMatchData] = {

    def extraction1(references: JsValue): Option[IndexedSeq[JsValue]] = {
      val sequence = references match {
        case JsArray(elements) => Some(elements)
        case _                 => None
      }
      sequence
    }.map(_.toIndexedSeq)

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

    val optionalUrl = for {
      references <- articlePage.getJavascriptConfig.get("references")
      entries1 <- extraction1(references)
      entries2 =
        entries1
          .map(entryToDataPair)
          .filter(_.isDefined)
          .map(_.get) // .get is fundamentally dangerous but fine in this case because we filtered the Nones out.
          .filter(_._1 == "pa-football-team")
    } yield {
      entries2.toList match {
        case e1 :: e2 :: _ =>
          val localDate = articlePage.item.trail.webPublicationDate.toLocalDate
          val navUrl = getMatchNavUrl(Configuration.ajax.url, localDate, e1._2, e2._2, articlePage.metadata.id)
          val headerUrl = getMatchHeaderUrl(Configuration.ajax.url, localDate, e1._2, e2._2)
          val statsUrl = getMatchStatsUrl(Configuration.ajax.url, localDate, e1._2, e2._2)
          Some(
            DotcomRenderingMatchData(
              matchUrl = navUrl,
              matchHeaderUrl = Some(headerUrl),
              matchStatsUrl = Some(statsUrl),
              matchType = FootballMatchType,
            ),
          )
        case _ => None
      }
    }

    optionalUrl.flatten
  }

  def assetURL(bundlePath: String): String = {
    // This function exists because for some reasons `Static` behaves differently in { PROD and CODE } versus LOCAL
    if (Configuration.environment.isProd || Configuration.environment.isCode) {
      Static(bundlePath)
    } else {
      s"${Configuration.site.host}${Static(bundlePath)}"
    }
  }

  // note: this is duplicated in the onward service (DotcomponentsOnwardsModels - if duplicating again consider moving to common! :()
  def findPillar(pillar: Option[Pillar], designType: Option[DesignType]): String = {
    pillar
      .map { pillar =>
        if (designType.contains(AdvertisementFeature)) "labs"
        else if (pillar.toString.toLowerCase == "arts") "culture"
        else pillar.toString.toLowerCase()
      }
      .getOrElse("news")
  }

  def getKeyEventsIfFiltered(filterKeyEvents: Boolean, blocks: APIBlocks): Option[List[APIBlock]] = {
    if (filterKeyEvents) {
      blocks.requestedBodyBlocks.flatMap { requested =>
        for {
          keyEvents <- requested.get(CanonicalLiveBlog.timeline)
          summaries <- requested.get(CanonicalLiveBlog.summary)
        } yield {
          val res: Seq[APIBlock] = (keyEvents.toSeq ++ summaries.toSeq)
          orderBlocks(res).toList
        }
      }
    } else None
  }

  def getLatest60Blocks(blocks: APIBlocks): Option[List[APIBlock]] = {
    blocks.requestedBodyBlocks.flatMap(_.get(CanonicalLiveBlog.firstPage).map(_.toList))
  }

  def blocksForLiveblogPage(
      pageBlocks: BlocksOn[LiveBlogPage],
      filterKeyEvents: Boolean,
  ): Seq[APIBlock] = {
    val blocks = pageBlocks.blocks
    // When the key events filter is on, we'd need all of the key events rather than just the latest 60 blocks
    val allBlocks =
      getKeyEventsIfFiltered(filterKeyEvents, blocks)
        .orElse(getLatest60Blocks(blocks))
        .getOrElse(List.empty)

    // For the newest page, the latest 60 blocks are requested, but for other page,
    // all of the blocks have been requested and returned in the blocks.body bit
    // of the response so we use those
    val relevantBlocks = if (allBlocks.isEmpty) blocks.body.getOrElse(Nil) else allBlocks

    val ids = pageBlocks.page.currentPage.currentPage.blocks.map(_.id).toSet
    relevantBlocks.filter(block => ids(block.id))
  }.toSeq
  def stringContainsAffiliateableLinks(textString: String): Boolean = {
    AffiliateLinksCleaner.stringContainsAffiliateableLinks(textString)
  }

  def blockElementsToPageElements(
      capiElems: Seq[ClientBlockElement],
      request: RequestHeader,
      article: ContentType,
      affiliateLinks: Boolean,
      isMainBlock: Boolean,
      campaigns: Option[JsValue],
      calloutsUrl: Option[String],
  ): List[PageElement] = {

    val atoms: Iterable[Atom] = article.atoms.map(_.all).getOrElse(Seq())
    val edition = Edition(request)

    val elems = capiElems.toList
      .flatMap(el =>
        PageElement.make(
          element = el,
          addAffiliateLinks = affiliateLinks,
          pageUrl = request.uri,
          atoms = atoms,
          isMainBlock,
          article.content.metadata.format.exists(_.display == ImmersiveDisplay),
          campaigns,
          calloutsUrl,
          article.elements.thumbnail,
          edition,
          article.trail.webPublicationDate,
          article.content.isGallery,
          article.content.isUSProductionOffice,
        ),
      )
      .filter(PageElement.isSupported)

    val withTagLinks =
      if (article.content.isPaidContent) elems
      else TextCleaner.tagLinks(elems, article.content.tags, article.content.showInRelated, edition)

    withTagLinks
  }

  def isSpecialReport(page: ContentPage): Boolean =
    page.item.content.cardStyle == SpecialReport

  def secondaryDateString(content: ContentType, request: RequestHeader): String = {
    def format(dt: DateTime, req: RequestHeader): String = GUDateTimeFormatNew.formatDateTimeForDisplay(dt, req)

    val firstPublicationDate = content.fields.firstPublicationDate
    val webPublicationDate = content.trail.webPublicationDate
    val isModified = content.content.hasBeenModified && (!firstPublicationDate.contains(webPublicationDate))

    if (isModified) {
      "First published on " + format(firstPublicationDate.getOrElse(webPublicationDate), request)
    } else {
      "Last modified on " + format(content.fields.lastModified, request)
    }
  }

  def withoutNull(json: JsValue): JsValue = {
    json match {
      case JsObject(fields) => JsObject(fields.filterNot { case (_, value) => value == JsNull })
      case other            => other
    }
  }

  def withoutDeepNull(json: JsValue): JsValue = {
    json match {
      case JsObject(fields) =>
        JsObject(fields.collect {
          case (key, value) if value != JsNull => key -> withoutDeepNull(value)
        })
      case JsArray(values) =>
        JsArray(values.collect {
          case value if value != JsNull => withoutDeepNull(value)
        })
      case other => other
    }
  }

  def shouldAddAffiliateLinks(content: ContentType): Boolean = {
    if (content.content.isGallery) {
      // For galleries, the disclaimer is only inserted in the header so we don't need
      // a check for paragraphs as in other articles
      AffiliateLinksCleaner.shouldAddAffiliateLinks(
        switchedOn = Switches.AffiliateLinks.isSwitchedOn,
        showAffiliateLinks = content.content.fields.showAffiliateLinks,
        alwaysOffTags = Configuration.affiliateLinks.alwaysOffTags,
        tagPaths = content.content.tags.tags.map(_.id),
      )
    } else {
      val contentHtml = Jsoup.parse(content.fields.body)
      val bodyElements = contentHtml.select("body").first().children()

      /** On smaller devices, the disclaimer is inserted before paragraph 2 of the article body and floats left. This
        * logic ensures there are two clear paragraphs of text at the top of the article. We don't support inserting the
        * disclaimer next to other element types. It also ensures the second paragraph is long enough to accommodate the
        * disclaimer appearing alongside it.
        */
      if (bodyElements.size >= 2) {
        val firstEl = bodyElements.get(0)
        val secondEl = bodyElements.get(1)
        if (firstEl.tagName == "p" && secondEl.tagName == "p" && secondEl.text().length >= 150) {
          AffiliateLinksCleaner.shouldAddAffiliateLinks(
            switchedOn = Switches.AffiliateLinks.isSwitchedOn,
            showAffiliateLinks = content.content.fields.showAffiliateLinks,
            alwaysOffTags = Configuration.affiliateLinks.alwaysOffTags,
            tagPaths = content.content.tags.tags.map(_.id),
          )
        } else false
      } else false
    }

  }

  def contentDateTimes(content: ContentType): ArticleDateTimes = {
    ArticleDateTimes(
      webPublicationDate = content.trail.webPublicationDate,
      firstPublicationDate = content.fields.firstPublicationDate,
      hasBeenModified = content.content.hasBeenModified,
      lastModificationDate = content.fields.lastModified,
    )
  }

  def getModifiedContent(content: ContentType, forceLive: Boolean): ContentFormat = {
    val originalFormat = content.metadata.format.getOrElse(ContentFormat.defaultContentFormat)

    if (forceLive) {
      originalFormat.copy(design = LiveBlogDesign)
    } else {
      originalFormat
    }
  }

  def getMostRecentBlockId(blocks: APIBlocks): Option[String] = {
    blocks.requestedBodyBlocks
      .flatMap(_.get(CanonicalLiveBlog.firstPage))
      .getOrElse(blocks.body.getOrElse(Seq.empty))
      .headOption
      .map(block => s"block-${block.id}")
  }

  def orderBlocks(blocks: Seq[APIBlock]): Seq[APIBlock] =
    blocks.sortBy(block => block.firstPublishedDate.orElse(block.createdDate).map(_.dateTime)).reverse

  def ensureSummaryTitle(block: APIBlock): APIBlock = {
    if (block.attributes.summary.contains(true) && block.title.isEmpty) {
      block.copy(title = Some("Summary"))
    } else block
  }

  def getStoryPackage(
      faciaItems: Seq[PressedContent],
      requestHeader: RequestHeader,
  ): Option[OnwardCollectionResponse] = {
    faciaItems match {
      case Nil => None
      case _   =>
        Some(
          OnwardCollectionResponse(
            heading = "More on this story",
            trails = faciaItems.map(faciaItem => Trail.pressedContentToTrail(faciaItem)(requestHeader)).take(10),
          ),
        )
    }
  }

}
