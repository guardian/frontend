package model

import common._
import contentapi.ContentApiClient
import ContentApiClient.getResponse

trait LiveBlogAgent extends ExecutionContexts with Logging {
  import Edition.{all => editions}

  private val agents = editions.map(edition => edition.id -> AkkaAgent[Option[ContentType]](None)).toMap

  def refresh() = {
    log.info("Refreshing Live Blogs")
    editions.foreach{ edition =>
      findBlogFor(edition).foreach(blog => agents(edition.id).send(blog))
    }
  }

  private def findBlogFor(edition: Edition) = {
    val tag = "football/series/saturday-clockwatch|tone/minutebyminute"
    log.info(s"Fetching football blogs with tag: $tag")

    getResponse(
      ContentApiClient.item("/football", edition)
        .tag(tag)
        .showEditorsPicks(true)
    ).map {response =>

      val editorsPicks = response.editorsPicks.getOrElse(Nil) map { Content(_) }

      val editorsPicksIds = editorsPicks map { _.metadata.id }

      val latestContent = response.results.getOrElse(Nil) map { Content(_) } filterNot { c => editorsPicksIds contains c.metadata.id }

      // order by editors' picks first
      val liveBlogs: Seq[ContentType] = (editorsPicks ++ latestContent).filter(_.fields.isLive)

      liveBlogs.find(isClockWatch).orElse(liveBlogs.headOption)
    }
  }

  private def isClockWatch(content: ContentType) = content.tags.tags.exists(_.id == "football/series/saturday-clockwatch")

  def blogFor(edition: Edition) = agents(edition.id)
}

object LiveBlogAgent extends LiveBlogAgent {
  def apply(edition: Edition) = blogFor(edition)()
}
