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
  def switch: Switch
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

  val switch = Switches.JobFeedSwitch
  override val responseEncoding = utf8
}

case class SoulmatesFeedMetaData(baseUrl: String, agent: SoulmatesAgent) extends FeedMetaData {

  val name = s"soulmates/${agent.groupName}"
  val url = s"$baseUrl/${agent.feed.path}"
  val switch = Switches.SoulmatesFeedSwitch
  override val responseEncoding = utf8
}

case class BestsellersFeedMetaData(domain: String) extends FeedMetaData {

  val name = "bestsellers"
  val url = s"http://$domain/bertrams/feed/independentsTop20"
  val switch = Switches.GuBookshopFeedsSwitch
  override val responseEncoding = utf8
}

case class MasterclassesFeedMetaData(accessToken: String, override val parameters: Map[String, String])
  extends FeedMetaData {

  val name = "masterclasses"
  val url = "https://www.eventbriteapi.com/v3/users/me/owned_events/"
  val baseParameters = Map(
    "token" -> accessToken,
    "status" -> "live",
    "expand" -> "ticket_classes,venue"
  )
  override val timeout = 20.seconds
  val switch = Switches.MasterclassFeedSwitch
}

case class TravelOffersFeedMetaData(url: String) extends FeedMetaData {

  override def name: String = "travel-offers"

  override def switch: Switch = Switches.TravelOffersFeedSwitch
}
