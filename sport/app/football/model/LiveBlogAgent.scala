package model

import common._
import conf.ContentApi


trait LiveBlogAgent extends ExecutionContexts with Logging {

  import Edition.{all => editions}

  private val agents = editions.map(edition => edition.id -> AkkaAgent[Option[Trail]](None)).toMap

  def refresh() = {
    log.info("Refreshing Live Blogs")
    editions.foreach{ edition =>
      findBlogFor(edition).foreach(blog => agents(edition.id).send(blog))
    }
  }

  private def findBlogFor(edition: Edition) = {
    val tag = "football/series/saturday-clockwatch|tone/minutebyminute"
    log.info(s"Fetching football blogs with tag: $tag")
    ContentApi.item("/football", edition)
      .tag(tag)
      .showEditorsPicks(true)
      .response.map {response =>

      val editorsPicks = response.editorsPicks map { Content(_) }

      val editorsPicksIds = editorsPicks map { _.id }

      val latestContent = response.results map { Content(_) } filterNot { c => editorsPicksIds contains c.id }

      // order by editors' picks first
      val liveBlogs: Seq[Content] = (editorsPicks ++ latestContent).filter(_.isLive)

      liveBlogs.find(isClockWatch).orElse(liveBlogs.headOption)
    }
  }

  private def isClockWatch(content: Content) = content.tags.exists(_.id == "football/series/saturday-clockwatch")

  def blogFor(edition: Edition) = agents(edition.id)

  def stop() {
    agents.values.foreach(_.close())
  }
}

object LiveBlogAgent extends LiveBlogAgent {
  def apply(edition: Edition) = blogFor(edition)()
}
