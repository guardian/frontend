package model.commercial

import com.gu.contentapi.client.model.v1.Tag
import common.Edition.defaultEdition
import common.{ExecutionContexts, Logging}
import contentapi.ContentApiClient
import ContentApiClient.getResponse
import model.{ImageElement, ContentType, Content}

import scala.concurrent.Future

object Lookup extends ExecutionContexts with Logging {

  def content(contentId: String): Future[Option[ContentType]] = {
    val response = try {
      getResponse(ContentApiClient.item(contentId, defaultEdition))
    } catch {
      case e: Exception => Future.failed(e)
    }
    response map {
      _.content map (Content(_))
    } recover {
      case e: Exception =>
        log.info(s"CAPI search for item '$contentId' failed: ${e.getMessage}")
        None
    }
  }

  def contentByShortUrls(shortUrls: Seq[String]): Future[Seq[ContentType]] = {
    if (shortUrls.nonEmpty) {
      val shortIds = shortUrls map (_.replaceFirst("^[a-zA-Z]+://gu.com/","")) mkString ","
      getResponse(ContentApiClient.search(defaultEdition).ids(shortIds)) map {
        _.results map (Content(_))
      }
    } else Future.successful(Nil)
  }

  def latestContentByKeyword(keywordId: String, maxItemCount: Int): Future[Seq[ContentType]] = {
    getResponse(ContentApiClient.search(defaultEdition).tag(keywordId).pageSize(maxItemCount).orderBy("newest")) map {
      _.results map (Content(_))
    }
  }

  def mainPicture(contentId: String): Future[Option[ImageElement]] = {
    content(contentId) map (_ flatMap (_.elements.mainPicture))
  }

  def keyword(term: String, section: Option[String] = None): Future[Seq[Tag]] = {
    val baseQuery = ContentApiClient.tags.q(term).tagType("keyword").pageSize(50)
    val query = section.foldLeft(baseQuery)((acc, sectionName) => acc section sectionName)

    val result = getResponse(query).map(_.results) recover {
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
