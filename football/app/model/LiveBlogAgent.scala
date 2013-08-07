package model

import akka.actor.Cancellable
import common._
import conf.ContentApi
import scala.concurrent.duration._


trait LiveBlogAgent extends ExecutionContexts with Logging {

  import Edition.{all => editions}

  private val agents = editions.map(edition => edition.id -> AkkaAgent[Option[Trail]](None)).toMap

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

  def start() {
    schedule = Some(AkkaScheduler.every(2.minutes, initialDelay = 10.seconds) {
      refreshLiveBlogs()
    })
  }
  def stop() {
    close()
    schedule.foreach(_.cancel())
  }
}
