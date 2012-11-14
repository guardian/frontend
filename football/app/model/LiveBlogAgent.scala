package model

import common.{ AkkaSupport, Logging }
import conf.ContentApi
import akka.actor.Cancellable
import akka.util.Duration
import java.util.concurrent.TimeUnit._

trait LiveBlogAgent extends AkkaSupport with Logging {

  private val usAgent = play_akka.agent[Option[Trail]](None)
  private val ukAgent = play_akka.agent[Option[Trail]](None)

  def refreshLiveBlogs() = {
    ukAgent.sendOff { old => findBlogFor("UK") }
    usAgent.sendOff { old => findBlogFor("US") }
  }

  private def findBlogFor(edition: String) = {
    val tag = "football/series/saturday-clockwatch|tone/minutebyminute,(" + ContentApi.supportedTypes + ")"
    log.info("Fetching football blogs with tag: " + tag)
    val liveBlogs: Seq[Content] = ContentApi.search(edition)
      .section("football")
      .tag(tag)
      .response.results.map(new Content(_))
      .filter(_.isLive)

    liveBlogs.find(isClockWatch).orElse(liveBlogs.headOption)
  }

  private def isClockWatch(content: Content) = content.tags.exists(_.id == "football/series/saturday-clockwatch")

  def blogFor(edition: String) = edition match {
    case "US" => usAgent()
    case _ => ukAgent()
  }

  def close() {
    ukAgent.close()
    usAgent.close()
  }

}

object LiveBlog extends LiveBlogAgent {
  def apply(edition: String) = blogFor(edition)

  private var schedule: Option[Cancellable] = None

  def startup() {
    schedule = Some(play_akka.scheduler.every(Duration(2, MINUTES), initialDelay = Duration(10, SECONDS)) {
      refreshLiveBlogs()
    })
  }
  def shutdown() {
    close()
    schedule.foreach(_.cancel())
  }
}
