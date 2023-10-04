package commercial.model.feeds

import commercial.model.feeds.ResponseEncoding.utf8
import conf.switches.{Switch, Switches}

import scala.concurrent.duration.{Duration, _}

sealed trait FeedMetaData {

  def name: String
  def url: String
  def parameters: Map[String, String] = Map.empty
  def timeout: Duration = 2.seconds
  def responseEncoding: String = ResponseEncoding.default
}

case class JobsFeedMetaData(override val url: String) extends FeedMetaData {

  val name = "jobs"

  override val responseEncoding = utf8
}

case class TravelOffersFeedMetaData(url: String) extends FeedMetaData {

  override def name: String = "travel-offers"

  override val timeout = 10.seconds
}
