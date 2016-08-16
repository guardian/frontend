package model.commercial

import com.gu.contentapi.client.model.v1.{Tag, Content => ApiContent}
import common.Edition.defaultEdition
import common.{Edition, ExecutionContexts, Logging}
import contentapi.ContentApiClient
import contentapi.ContentApiClient.getResponse
import model.{Content, ContentType, ImageElement}

import scala.concurrent.Future
import scala.util.control.NonFatal

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

  def content[T](itemId: String, edition: Edition)(transform: ApiContent => Option[T]): Future[Option[T]] = {
    val query = ContentApiClient.item(itemId, edition)
                .showFields("all")
                .showTags("all")
                .showAtoms("all")
    val result = ContentApiClient.getResponse(query) map { response => response.content flatMap transform }
    result.onFailure {
      case NonFatal(e) => log.warn(s"Capi lookup of item '$itemId' failed: ${e.getMessage}")
    }
    result
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
