package tools

import common.Logging
import conf.AdminConfiguration
import conf.Configuration.commercial._
import dfp._
import implicits.Dates
import org.joda.time.DateTime
import play.api.libs.json.Json
import services.S3

trait Store extends Logging with Dates {
  lazy val configKey = AdminConfiguration.configKey
  lazy val switchesKey = AdminConfiguration.switchesKey
  lazy val topStoriesKey = AdminConfiguration.topStoriesKey

  final val defaultJsonEncoding: String = "application/json;charset=utf-8"

  def getConfig = S3.get(configKey)
  def putConfig(config: String) { S3.putPublic(configKey, config, "application/json") }

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
  def putCachedTravelOffersFeed(everything: String) {
    S3.putPublic(travelOffersS3Key, everything, "text/plain")
  }

  val now: String = DateTime.now().toHttpDateTimeString

  def getDfpPaidForTags(): PaidForTagsReport =
    S3.get(dfpPaidForTagsDataKey).map {
    Json.parse(_).as[PaidForTagsReport]
  }.getOrElse(PaidForTagsReport(now, Nil))

  def getDfpPageSkinnedAdUnits() =
    S3.get(dfpPageSkinnedAdUnitsKey).flatMap(PageSkinSponsorshipReportParser(_)) getOrElse PageSkinSponsorshipReport(now, Nil)

  def getDfpInlineMerchandisingTargetedTagsReport(): InlineMerchandisingTargetedTagsReport = {
    S3.get(dfpInlineMerchandisingTagsDataKey) flatMap (InlineMerchandisingTargetedTagsReportParser(_))
  } getOrElse InlineMerchandisingTargetedTagsReport(now, InlineMerchandisingTagSet())

  def getDfpLineItemsReport() = S3.get(dfpLineItemsKey)
}

object Store extends Store
