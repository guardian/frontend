package tools

import common.Logging
import common.dfp._
import conf.Configuration.commercial._
import conf.{AdminConfiguration, Configuration}
import implicits.Dates
import org.joda.time.DateTime
import play.api.libs.json.Json
import play.api.libs.json.Json.toJson
import services.S3

trait Store extends Logging with Dates {
  lazy val switchesKey = Configuration.switches.key
  lazy val topStoriesKey = AdminConfiguration.topStoriesKey

  final val defaultJsonEncoding: String = "application/json;charset=utf-8"

  def getSwitches = S3.get(switchesKey)
  def getSwitchesWithLastModified = S3.getWithLastModified(switchesKey)
  def getSwitchesLastModified = S3.getLastModified(switchesKey)
  def putSwitches(config: String) { S3.putPublic(switchesKey, config, "text/plain") }

  def getTopStories = S3.get(topStoriesKey)
  def putTopStories(config: String) { S3.putPublic(topStoriesKey, config, "application/json") }

  def putDfpPaidForTags(content: String) {
    S3.putPublic(dfpPaidForTagsDataKey, content, defaultJsonEncoding)
  }
  def putInlineMerchandisingSponsorships(keywordsJson: String) {
    S3.putPublic(dfpInlineMerchandisingTagsDataKey, keywordsJson, defaultJsonEncoding)
  }
  def putDfpPageSkinAdUnits(adUnitJson: String) {
    S3.putPublic(dfpPageSkinnedAdUnitsKey, adUnitJson, defaultJsonEncoding )
  }
  def putDfpLineItemsReport(everything: String) {
    S3.putPublic(dfpLineItemsKey, everything, defaultJsonEncoding)
  }
  def putDfpAdFeatureReport(adFeaturesJson: String) {
    S3.putPublic(dfpAdFeatureReportKey, adFeaturesJson, defaultJsonEncoding)
  }
  def putDfpActiveAdUnitList(adUnits: String) {
    S3.putPublic(dfpActiveAdUnitListKey, adUnits, "text/plain")
  }
  def putCachedTravelOffersFeed(everything: String) {
    S3.putPublic(travelOffersS3Key, everything, "text/plain")
  }

  val now: String = DateTime.now().toHttpDateTimeString

  def getDfpPaidForTags(key: String = dfpPaidForTagsDataKey): PaidForTagsReport =
    S3.get(key).map {
    Json.parse(_).as[PaidForTagsReport]
  }.getOrElse(PaidForTagsReport(now, Nil))

  def getDfpPageSkinnedAdUnits() =
    S3.get(dfpPageSkinnedAdUnitsKey).flatMap(PageSkinSponsorshipReportParser(_)) getOrElse PageSkinSponsorshipReport(now, Nil)

  def getDfpInlineMerchandisingTargetedTagsReport(): InlineMerchandisingTargetedTagsReport = {
    S3.get(dfpInlineMerchandisingTagsDataKey) flatMap (InlineMerchandisingTargetedTagsReportParser(_))
  } getOrElse InlineMerchandisingTargetedTagsReport(now, InlineMerchandisingTagSet())

  def getDfpLineItemsReport() = S3.get(dfpLineItemsKey)

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
