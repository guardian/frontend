package model

import common.{Edition, AkkaSupport, Logging}
import conf.ContentApi
import akka.actor.Cancellable
import java.util.concurrent.TimeUnit._
import com.gu.openplatform.contentapi.model.ItemResponse
import play.api.libs.concurrent.Execution.Implicits._
import scala.concurrent.duration._

trait LiveBlogAgent extends AkkaSupport with Logging {

  import Edition.{all => editions}

  private val agents = editions.map(edition => edition.id -> play_akka.agent[Option[Trail]](None)).toMap

  // TODO editions
  def refreshLiveBlogs() = {
    editions.foreach{ edition =>
      findBlogFor(edition).foreach(blog => agents(edition.id).send(blog))
    }
  }

  private def findBlogFor(edition: Edition) = {
    val tag = s"football/series/saturday-clockwatch|tone/minutebyminute,(${ContentApi.supportedTypes})"
    log.info(s"Fetching football blogs with tag: $tag")
    ContentApi.item("/football", edition)
      .tag(tag)
      .showEditorsPicks(true)
      .response.map {response =>

      val editorsPicks = response.editorsPicks map { new Content(_) }

      val editorsPicksIds = editorsPicks map { _.id }

      val latestContent = response.results map { new Content(_) } filterNot { c => editorsPicksIds contains (c.id) }

      // order by editors' picks first
      val liveBlogs: Seq[Content] = (editorsPicks ++ latestContent).filter(_.isLive)

      liveBlogs.find(isClockWatch).orElse(liveBlogs.headOption)
    }
  }

  private def isClockWatch(content: Content) = content.tags.exists(_.id == "football/series/saturday-clockwatch")

  // TODO EDITIONS
  def blogFor(edition: Edition) = agents(edition.id)

  def close() {
    agents.values.foreach(_.close())
  }

}

object LiveBlog extends LiveBlogAgent {
  def apply(edition: Edition) = blogFor(edition)()

  private var schedule: Option[Cancellable] = None

  def startup() {
    schedule = Some(play_akka.scheduler.every(2.minutes, initialDelay = 10.seconds) {
      refreshLiveBlogs()
    })
  }
  def shutdown() {
    close()
    schedule.foreach(_.cancel())
  }
}
