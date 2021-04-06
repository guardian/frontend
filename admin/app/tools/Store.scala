package tools

import common.GuLogging
import common.dfp._
import conf.Configuration.commercial._
import conf.{AdminConfiguration, Configuration}
import implicits.Dates
import org.joda.time.DateTime
import play.api.libs.json.{JsError, JsSuccess, Json}
import play.api.libs.json.Json.toJson
import services.S3

trait Store extends GuLogging with Dates {
  lazy val switchesKey = Configuration.switches.key
  lazy val topStoriesKey = AdminConfiguration.topStoriesKey

  final val defaultJsonEncoding: String = "application/json;charset=utf-8"

  def getSwitches: Option[String] = S3.get(switchesKey)
  def getSwitchesWithLastModified: Option[(String, DateTime)] = S3.getWithLastModified(switchesKey)
  def getSwitchesLastModified: Option[DateTime] = S3.getLastModified(switchesKey)
  def putSwitches(config: String): Unit = { S3.putPublic(switchesKey, config, "text/plain") }

  def getTopStories: Option[String] = S3.get(topStoriesKey)
  def putTopStories(config: String): Unit = { S3.putPublic(topStoriesKey, config, "application/json") }

  def putInlineMerchandisingSponsorships(keywordsJson: String): Unit = {
    S3.putPublic(dfpInlineMerchandisingTagsDataKey, keywordsJson, defaultJsonEncoding)
  }
  def putHighMerchandisingSponsorships(keywordsJson: String): Unit = {
    S3.putPublic(dfpHighMerchandisingTagsDataKey, keywordsJson, defaultJsonEncoding)
  }
  def putDfpPageSkinAdUnits(adUnitJson: String): Unit = {
    S3.putPublic(dfpPageSkinnedAdUnitsKey, adUnitJson, defaultJsonEncoding)
  }
  def putDfpLineItemsReport(everything: String): Unit = {
    S3.putPublic(dfpLineItemsKey, everything, defaultJsonEncoding)
  }
  def putDfpAdUnitList(filename: String, adUnits: String): Unit = {
    S3.putPublic(filename, adUnits, "text/plain")
  }
  def putTopAboveNavSlotTakeovers(takeovers: String): Unit = {
    S3.putPublic(topAboveNavSlotTakeoversKey, takeovers, defaultJsonEncoding)
  }
  def putDfpTemplateCreatives(creatives: String): Unit = {
    S3.putPublic(dfpTemplateCreativesKey, creatives, defaultJsonEncoding)
  }
  def putDfpCustomTargetingKeyValues(keyValues: String): Unit = {
    S3.putPublic(dfpCustomTargetingKey, keyValues, defaultJsonEncoding)
  }
  def putNonRefreshableLineItemIds(lineItemIds: Seq[Long]): Unit = {
    S3.putPublic(dfpNonRefreshableLineItemIdsKey, Json.stringify(toJson(lineItemIds)), defaultJsonEncoding)
  }

  val now: String = DateTime.now().toHttpDateTimeString

  def getDfpPageSkinnedAdUnits(): PageSkinSponsorshipReport =
    S3.get(dfpPageSkinnedAdUnitsKey).flatMap(PageSkinSponsorshipReportParser(_)) getOrElse PageSkinSponsorshipReport(
      now,
      Nil,
    )

  def getDfpInlineMerchandisingTargetedTagsReport(): InlineMerchandisingTargetedTagsReport = {
    S3.get(dfpInlineMerchandisingTagsDataKey) flatMap (InlineMerchandisingTargetedTagsReportParser(_))
  } getOrElse InlineMerchandisingTargetedTagsReport(now, InlineMerchandisingTagSet())

  def getDfpHighMerchandisingTargetedTagsReport(): HighMerchandisingTargetedTagsReport = {
    S3.get(dfpHighMerchandisingTagsDataKey) flatMap (HighMerchandisingTargetedTagsReportParser(_))
  } getOrElse HighMerchandisingTargetedTagsReport(now, HighMerchandisingLineItems(items = List.empty))

  def getDfpLineItemsReport(): LineItemReport = {
    val maybeLineItems = for {
      json <- S3.get(dfpLineItemsKey)
      lineItemReport <- Json.parse(json).asOpt[LineItemReport]
    } yield lineItemReport

    maybeLineItems getOrElse LineItemReport("Empty Report", Nil, Nil)
  }

  def getSlotTakeoversReport(slotName: String): Option[String] =
    slotName match {
      case "top-above-nav" => S3.get(topAboveNavSlotTakeoversKey)
      case _               => None
    }

  def getDfpTemplateCreatives: Seq[GuCreative] = {
    val creatives = for (doc <- S3.get(dfpTemplateCreativesKey)) yield {
      Json.parse(doc).as[Seq[GuCreative]]
    }
    creatives getOrElse Nil
  }

  def getDfpCustomTargetingKeyValues: Seq[GuCustomTargeting] = {
    val targeting = for (doc <- S3.get(dfpCustomTargetingKey)) yield {
      val json = Json.parse(doc)
      json.validate[Seq[GuCustomTargeting]] match {
        case s: JsSuccess[Seq[GuCustomTargeting]] => s.get.sortBy(_.name)
        case e: JsError                           => log.error("Errors: " + JsError.toJson(e).toString()); Nil
      }
    }
    targeting getOrElse Nil
  }

  object commercial {

    def getTakeoversWithEmptyMPUs(): Seq[TakeoverWithEmptyMPUs] = {
      S3.get(takeoversWithEmptyMPUsKey) map {
        Json.parse(_).as[Seq[TakeoverWithEmptyMPUs]]
      } getOrElse Nil
    }

    def putTakeoversWithEmptyMPUs(takeovers: Seq[TakeoverWithEmptyMPUs]): Unit = {
      val content = Json.stringify(toJson(takeovers))
      S3.putPrivate(takeoversWithEmptyMPUsKey, content, "application/json")
    }
  }
}

object Store extends Store
