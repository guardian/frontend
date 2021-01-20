package commercial.model.capi

import model.ContentType
import play.api.libs.json.{Json, Writes}
import common.Edition

// The information needed to render the native cAPI multiple ad.
case class CapiMultiple(articles: Seq[CapiSingle])

object CapiMultiple {

  def fromContent(articles: Seq[ContentType], edition: Edition): CapiMultiple = {

    CapiMultiple(articles.map(article => {
      CapiSingle.fromContent(article, edition, articles.length)
    }))

  }

  implicit val writesCapiMultiple: Writes[CapiMultiple] =
    Json.writes[CapiMultiple]

}
