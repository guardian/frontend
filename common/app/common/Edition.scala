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

  /*
  TODO For a while we need to live with both Multi domain sites and single domain sites
  this abstracts away getting the edition for those. Later we will simplify this
   */
  def apply(request: RequestHeader): Edition = {

    val editionFromParameter = request.getQueryString("_edition").map(_.toUpperCase)
    val editionFromHeader = request.headers.get("X-Gu-Edition").map(_.toUpperCase)
    val editionFromSite = Site(request).map(_.edition)

    val editionId = editionFromParameter.orElse(editionFromHeader)
      .orElse(editionFromSite).getOrElse(Edition.defaultEdition)

    all.find(_.id == editionId).getOrElse(defaultEdition)
  }

  def others(implicit request: RequestHeader): Seq[Edition] = {
    val currentEdition = Edition(request)
    all.filter(_ != currentEdition)
  }
}
