package tools

import common.Logging
import conf.AdminConfiguration
import conf.Configuration.commercial.{dfpAdvertisementFeatureTagsDataKey, dfpSponsoredTagsDataKey, dfpPageSkinnedAdUnitsKey, dfpLineItemsKey}
import services.S3
import play.api.libs.json.Json

trait Store extends Logging {
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

  def putDfpSponsoredTags(keywordsJson: String) {
    S3.putPublic(dfpSponsoredTagsDataKey, keywordsJson, defaultJsonEncoding)
  }
  def putDfpAdvertisementFeatureTags(keywordsJson: String) {
    S3.putPublic(dfpAdvertisementFeatureTagsDataKey, keywordsJson, defaultJsonEncoding)
  }
  def putDfpPageSkinAdUnits(adUnitJson: String) {
    S3.putPublic(dfpPageSkinnedAdUnitsKey, adUnitJson, defaultJsonEncoding )
  }
  def putDfpLineItemsReport(everything: String) {
    S3.putPublic(dfpLineItemsKey, everything, defaultJsonEncoding)
  }

  def getDfpSponsoredTags() = S3.get(dfpSponsoredTagsDataKey)
  def getDfpAdvertisementTags() = S3.get(dfpAdvertisementFeatureTagsDataKey)
  def getDfpPageSkinnedAdUnits() = S3.get(dfpPageSkinnedAdUnitsKey)
  def getDfpLineItemsReport() = S3.get(dfpLineItemsKey)
}

object Store extends Store
