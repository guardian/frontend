package commercial.model.feeds

import commercial.model.feeds.ResponseEncoding.utf8
import conf.switches.{Switch, Switches}

import scala.concurrent.duration.{Duration, _}

sealed trait FeedMetaData {

  def name: String
  def url: String
  def parameters: Map[String, String] = Map.empty
  def timeout: Duration = 2.seconds

  def fetchSwitch: Switch

  def parseSwitch: Switch
  def responseEncoding: String = ResponseEncoding.default
}

case class JobsFeedMetaData(override val url: String) extends FeedMetaData {

  val name = "jobs"

  override val fetchSwitch = Switches.JobsFeedFetchSwitch
  override val parseSwitch = Switches.JobsFeedParseSwitch

  override val responseEncoding = utf8
}

case class BestsellersFeedMetaData(domain: String) extends FeedMetaData {

  val name = "bestsellers"
  val url = s"https://$domain/bertrams/feed/independentsTop20"

  override val fetchSwitch = Switches.GuBookshopFeedsSwitch
  override val parseSwitch = Switches.GuBookshopFeedsSwitch

  override val responseEncoding = utf8
}

case class EventsFeedMetaData(feedName: String,
                              accessToken: String,
                              additionalParameters: Map[String, String] = Map.empty)
  extends FeedMetaData {

  val name = feedName
  val url = "https://www.eventbriteapi.com/v3/users/me/owned_events/"
  override val parameters = Map(
    "token" -> accessToken,
    "status" -> "live",
    "expand" -> "ticket_classes,venue"
  ) ++ additionalParameters

  override val timeout = 20.seconds

  override val fetchSwitch = Switches.EventsFeedSwitch
  override val parseSwitch = Switches.EventsFeedSwitch
}

case class TravelOffersFeedMetaData(url: String) extends FeedMetaData {

  override def name: String = "travel-offers"

  override val timeout = 10.seconds

  override val fetchSwitch = Switches.TravelFeedFetchSwitch
  override val parseSwitch = Switches.TravelFeedParseSwitch
}
