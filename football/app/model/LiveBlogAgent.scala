package model

import common.{ AkkaSupport, Logging }
import conf.ContentApi
import akka.actor.Cancellable
import akka.util.Duration
import java.util.concurrent.TimeUnit._
import com.gu.openplatform.contentapi.model.ItemResponse

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
    val response: ItemResponse = ContentApi.item("/football", edition)
      .tag(tag)
      .showEditorsPicks(true)
      .response

    val editorsPicks = response.editorsPicks map { new Content(_) }

    val editorsPicksIds = editorsPicks map { _.id }

    val latestContent = response.results map { new Content(_) } filterNot { c => editorsPicksIds contains (c.id) }

    // order by editors' picks first
    val liveBlogs: Seq[Content] = (editorsPicks ++ latestContent).filter(_.isLive)

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
