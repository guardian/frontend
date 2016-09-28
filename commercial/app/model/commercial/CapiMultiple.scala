package model.commercial

import model.ContentType
import play.api.libs.json.{Json, Writes}

// The information needed to render the native cAPI multiple ad.
case class CapiMultiple(articles: Seq[CapiSingle])

object CapiMultiple {

  def fromContent(articles: Seq[ContentType]): CapiMultiple = {
    CapiMultiple(articles.map(CapiSingle.fromContent))
  }

  implicit val writesCapiMultiple: Writes[CapiMultiple] =
      Json.writes[CapiMultiple]

}
