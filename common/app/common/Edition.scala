package common

import play.api.mvc.RequestHeader
import org.joda.time.DateTimeZone
import model.{MetaData, TrailblockDescription}

// describes the ways in which editions differ from each other
abstract class Edition(
    val id: String,
    val displayName: String,
    val timezone: DateTimeZone
  ) {
  def configuredFronts: Map[String, Seq[TrailblockDescription]]
  def zones: Seq[Zone]
  def navigation(metadata: MetaData): Seq[NavItem]
}

object Edition {

  val defaultEdition = editions.Uk
  val all = Seq(
    editions.Uk,
    editions.Us
  )

  def apply(request: RequestHeader): Edition = {

    // override for Ajax calls
    val editionFromParameter = request.getQueryString("_edition").map(_.toUpperCase)

    // set upstream from geo location/ user preference
    val editionFromHeader = request.headers.get("X-Gu-Edition").map(_.toUpperCase)

    // TODO legacy fallback - delete after single site
    val editionFromSite = Site(request).map(_.edition)

    // NOTE: this only works on dev machines for local testing
    // in production no cookies make it this far
    val editionFromCookie = request.cookies.get("GU_EDITION").map(_.value.toUpperCase)

    val editionId = editionFromParameter
      .orElse(editionFromHeader)
      .orElse(editionFromCookie)
      .orElse(editionFromSite)
      .getOrElse(Edition.defaultEdition.id)

    all.find(_.id == editionId).getOrElse(defaultEdition)
  }

  def others(implicit request: RequestHeader): Seq[Edition] = {
    val currentEdition = Edition(request)
    all.filter(_ != currentEdition)
  }
}
