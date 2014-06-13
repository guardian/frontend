package tools

import common.Logging
import conf.AdminConfiguration
import conf.Configuration.commercial.{dfpAdvertisementFeatureKeywordsDataKey, dfpSponsoredKeywordsDataKey, dfpPageSkinnedAdUnitsKey}
import services.S3

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

  def putDfpSponsoredKeywords(keywordsJson: String) {
    S3.putPublic(dfpSponsoredKeywordsDataKey, keywordsJson, defaultJsonEncoding)
  }
  def putDfpAdvertisementFeatureKeywords(keywordsJson: String) {
    S3.putPublic(dfpAdvertisementFeatureKeywordsDataKey, keywordsJson, defaultJsonEncoding)
  }
  def putDfpPageSkinAdUnits(adUnitJson: String) {
    S3.putPublic(dfpPageSkinnedAdUnitsKey, adUnitJson, defaultJsonEncoding )
  }
}

object Store extends Store
