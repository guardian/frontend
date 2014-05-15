package common

import play.api.mvc.RequestHeader
import org.joda.time.DateTimeZone
import model.MetaData

// describes the ways in which editions differ from each other
abstract class Edition(
    val id: String,
    val displayName: String,
    val timezone: DateTimeZone
  ) extends Navigation {
  def zones: Seq[Zone]
  def navigation: Seq[NavItem]
}

object Edition {

  // gives templates an implicit edition
  implicit def edition(implicit request: RequestHeader) = this(request)

  val defaultEdition = editions.Uk

  val all = Seq(
    editions.Uk,
    editions.Us,
    editions.Au
  )

  lazy val editionFronts = Edition.all.map {e => "/" + e.id.toLowerCase}

  def editionId(request: RequestHeader): String = {
    // override for Ajax calls
    val editionFromParameter = request.getQueryString("_edition").map(_.toUpperCase)

    // set upstream from geo location/ user preference
    val editionFromHeader = request.headers.get("X-Gu-Edition").map(_.toUpperCase)

    // NOTE: this only works on dev machines for local testing
    // in production no cookies make it this far
    val editionFromCookie = request.cookies.get("GU_EDITION").map(_.value.toUpperCase)

    editionFromParameter
     .orElse(editionFromHeader)
     .orElse(editionFromCookie)
     .getOrElse(Edition.defaultEdition.id)
  }

  def apply(request: RequestHeader): Edition = {
    val id = editionId(request)
    all.find(_.id == id).getOrElse(defaultEdition)
  }

  def others(implicit request: RequestHeader): Seq[Edition] = Region(request).map(r =>  all).getOrElse {
    val currentEdition = Edition(request)
    all.filter(_ != currentEdition)
  }

  def byId(id: String) = all.find(_.id.equalsIgnoreCase(id))
}

object Editionalise {
  import common.editions.EditionalisedSections._

  def apply(id: String, edition: Edition, request: Option[RequestHeader] = None): String = {
    if (isEditionalised(id)) id match {
        case "" => s"${edition.id.toLowerCase}"
        case _ => s"${edition.id.toLowerCase}/$id"
    } else {
      id
    }
  }

  def apply(id: String, request: RequestHeader): String = this(id, Edition(request), Some(request))

}
