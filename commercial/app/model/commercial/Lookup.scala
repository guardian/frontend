package model.commercial

import com.gu.openplatform.contentapi.model.Tag
import common.Edition.defaultEdition
import common.{ExecutionContexts, Logging}
import conf.LiveContentApi
import model.{Content, ImageContainer}

import scala.concurrent.Future

object Lookup extends ExecutionContexts with Logging {

  def content(contentId: String): Future[Option[Content]] = {
    LiveContentApi.item(contentId, defaultEdition).response map {
      _.content map (Content(_))
    }
  }

  def mainPicture(contentId: String): Future[Option[ImageContainer]] = {
    content(contentId) map (_ flatMap (_.mainPicture))
  }

  def keyword(term: String, section: Option[String] = None): Future[Seq[Tag]] = {
    val baseQuery = LiveContentApi.tags.q(term).tagType("keyword").pageSize(50)
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
