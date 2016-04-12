package commercial.feeds

import commercial.feeds.ResponseEncoding.utf8
import conf.switches.{Switch, Switches}
import model.commercial.soulmates.SoulmatesAgent
import org.joda.time.{DateTime, DateTimeZone}

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

case class JobsFeedMetaData(urlTemplate: String) extends FeedMetaData {

  val name = "jobs"

  // url changes daily so cannot be val
  def url = {
    /*
     * Using offset time because this appears to be how the URL is constructed.
     * With UTC time we lose the feed for 2 hours at midnight every day.
     */
    val feedDate = new DateTime(DateTimeZone.forOffsetHours(-2)).toString("yyyy-MM-dd")
    urlTemplate replace("yyyy-MM-dd", feedDate)
  }

  override val fetchSwitch = Switches.JobFeedReadSwitch
  override val parseSwitch = Switches.JobParseSwitch

  override val responseEncoding = utf8
}

case class StaticJobsFeedMetaData(url: String) extends FeedMetaData {

  val name = "jobs(static)"

  override val fetchSwitch = Switches.StaticJobsFeedSwitch
  override val parseSwitch = Switches.JobParseSwitch

  override val responseEncoding = utf8
}


case class SoulmatesFeedMetaData(baseUrl: String, agent: SoulmatesAgent) extends FeedMetaData {

  val name = s"soulmates/${agent.groupName}"
  val url = s"$baseUrl/${agent.feed.path}"

  override val fetchSwitch = Switches.SoulmatesFeedSwitch
  override val parseSwitch = Switches.SoulmatesFeedSwitch

  override val responseEncoding = utf8
}

case class BestsellersFeedMetaData(domain: String) extends FeedMetaData {

  val name = "bestsellers"
  val url = s"http://$domain/bertrams/feed/independentsTop20"

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
