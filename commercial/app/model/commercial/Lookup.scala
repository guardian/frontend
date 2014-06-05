package model.commercial

import com.gu.openplatform.contentapi
import com.gu.openplatform.contentapi.model.Tag
import common.{Edition, Logging, ExecutionContexts}
import conf.ContentApi
import model.{ImageElement, Content}
import scala.concurrent.Future

object Lookup extends ExecutionContexts with Logging {
  def thumbnail(contentId: String): Future[Option[ImageElement]] = {
    ContentApi.item(contentId, Edition.defaultEdition).response.map { response =>
      val option: Option[contentapi.model.Content] = response.content
      option.flatMap(Content(_).thumbnail)
    }
  }


  def keyword(term: String, section: Option[String] = None): Future[Seq[Tag]] = {
    val baseQuery = ContentApi.tags.q(term).tagType("keyword").pageSize(50)
    val query = section.foldLeft(baseQuery)((acc, sectionName) => acc section sectionName)

    val result = query.response.map(_.results) recover {
      case e =>
        log.warn(s"Failed to look up [$term]: ${e.getMessage}")
        Nil
    }

    result onSuccess {
      case keywords => log.info(s"Looking up [$term] gave ${keywords.map(_.id)}")
    }

    result
  }
}
