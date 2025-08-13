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
  def putSwitches(config: String): Unit = { S3.putPrivate(switchesKey, config, "text/plain") }

  def getTopStories: Option[String] = S3.get(topStoriesKey)
  def putTopStories(config: String): Unit = { S3.putPublic(topStoriesKey, config, "application/json") }

  def putDfpLineItemsReport(everything: String): Unit = {
    S3.putPrivate(dfpLineItemsKey, everything, defaultJsonEncoding)
  }

  def putDfpCustomTargetingKeyValues(keyValues: String): Unit = {
    S3.putPrivate(dfpCustomTargetingKey, keyValues, defaultJsonEncoding)
  }

  val now: String = DateTime.now().toHttpDateTimeString

  def getDfpPageSkinnedAdUnits(): PageSkinSponsorshipReport =
    S3.get(dfpPageSkinnedAdUnitsKey).flatMap(PageSkinSponsorshipReportParser(_)) getOrElse PageSkinSponsorshipReport(
      now,
      Nil,
    )

  def getDfpLiveBlogTagsReport(): LiveBlogTopSponsorshipReport = {
    S3.get(dfpLiveBlogTopSponsorshipDataKey) flatMap (LiveBlogTopSponsorshipReportParser(
      _,
    )) getOrElse LiveBlogTopSponsorshipReport(
      None,
      Nil,
    )
  }
  def getDfpSurveyAdUnits(): SurveySponsorshipReport = {
    S3.get(dfpSurveySponsorshipDataKey) flatMap (SurveySponsorshipReportParser(
      _,
    )) getOrElse SurveySponsorshipReport(
      None,
      Nil,
    )
  }

  def getDfpLineItemsReport(): LineItemReport = {
    val maybeLineItems = for {
      json <- S3.get(dfpLineItemsKey)
      lineItemReport <- Json.parse(json).asOpt[LineItemReport]
    } yield lineItemReport

    maybeLineItems getOrElse LineItemReport("Empty Report", Nil, Nil)
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

  def getDfpCustomFields: Seq[GuCustomField] = {
    val customFields = for (doc <- S3.get(dfpCustomFieldsKey)) yield {
      Json.parse(doc).as[Seq[GuCustomField]]
    }
    customFields getOrElse Nil
  }

  def getDfpCreativeTemplates: Seq[GuCreativeTemplate] = {
    val creativeTemplates = for (doc <- S3.get(dfpCreativeTemplatesKey)) yield {
      Json.parse(doc).as[Seq[GuCreativeTemplate]]
    }
    creativeTemplates getOrElse Nil
  }

  def getAbTestFrameUrl: Option[String] = {
    S3.getPresignedUrl(abTestHtmlObjectKey)
  }

  def getDfpSpecialAdUnits: Seq[(String, String)] = {
    val specialAdUnits = for (doc <- S3.get(dfpSpecialAdUnitsKey)) yield {
      Json.parse(doc).as[Seq[(String, String)]]
    }
    specialAdUnits getOrElse Nil
  }
}

object Store extends Store
