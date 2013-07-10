package tools

import common.{ Logging, S3 }
import conf.AdminConfiguration

trait Store extends Logging {
  lazy val configKey = AdminConfiguration.configKey
  lazy val switchesKey = AdminConfiguration.switchesKey
  lazy val topStoriesKey = AdminConfiguration.topStoriesKey

  def getConfig = S3.get(configKey)
  def putConfig(config: String) { S3.put(configKey, config, "application/json") }

  def getSwitches = S3.get(switchesKey)
  def putSwitches(config: String) { S3.put(switchesKey, config, "text/plain") }

  def getTopStories = S3.get(topStoriesKey)
  def putTopStories(config: String) { S3.put(topStoriesKey, config, "application/json") }
}

object Store extends Store
