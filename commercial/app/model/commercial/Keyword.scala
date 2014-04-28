package model.commercial

import scala.concurrent.Future
import conf.ContentApi
import common.{Edition, Logging, ExecutionContexts}
import model.{ImageElement, Content}
import com.gu.openplatform.contentapi
import model.commercial.masterclasses.EventbriteMasterClass

case class Keyword(id: String, webTitle: String) {

  /* has to do same transformation as getKeywords in
   * common/app/assets/javascripts/modules/adverts/document-write.js
   * so that it can be used for matching
   */
  val name = webTitle.toLowerCase.replaceAll( """\s""", "-")

}

case class MasterClass(eventBriteEvent: EventbriteMasterClass, imageElement: Option[model.ImageElement])

object Lookup extends ExecutionContexts with Logging {
  def thumbnail(contentId: String): Future[Option[ImageElement]] = {
    ContentApi.item(contentId, Edition.defaultEdition).response.map{response =>
      val option: Option[contentapi.model.Content] = response.content
      option.flatMap(Content(_).thumbnail)
    }
  }


  def keyword(term: String, section: Option[String] = None): Future[Seq[Keyword]] = {
    val baseQuery = ContentApi.tags.q(term).tagType("keyword").pageSize(50)
    val query = section.foldLeft(baseQuery)((acc, sectionName) => acc section sectionName)

    val result = query.response.map {
      _.results.map(tag => Keyword(tag.id, tag.webTitle))
    } recover {
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
