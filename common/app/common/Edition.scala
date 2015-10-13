package common

import java.util.Locale

import org.joda.time.DateTimeZone
import play.api.libs.json._
import play.api.mvc.RequestHeader

// describes the ways in which editions differ from each other
abstract class Edition(
    val id: String,
    val displayName: String,
    val timezone: DateTimeZone,
    val locale: Locale,
    val homePagePath: String,
    val editionalisedSections: Seq[String] = Seq(
      "", // network front
      "business",
      "commentisfree",
      "culture",
      "money",
      "sport",
      "sustainable-business",
      "technology",
      "media",
      "environment",
      "film"
    )
  ) extends Navigation {

  def navigation: Seq[NavItem]
  def briefNav: Seq[NavItem]

  def isEditionalised(id: String) = editionalisedSections.contains(id)

  def matchesCookie(cookieValue: String): Boolean = id.equalsIgnoreCase(cookieValue)

}

object Edition {
  // gives templates an implicit edition
  implicit def edition(implicit request: RequestHeader): Edition = this(request)

  lazy val defaultEdition: Edition = editions.Uk

  lazy val all = List(
    editions.Uk,
    editions.Us,
    editions.Au,
    editions.International
  )

  lazy val editionFronts = Edition.all.map {e => "/" + e.id.toLowerCase}

  def isEditionFront(implicit request: RequestHeader): Boolean = editionFronts.contains(request.path)

  private def editionCookieValue(request: RequestHeader): String = {
    // override for Ajax calls
    val editionFromParameter = request.getQueryString("_edition")

    // set upstream from geo location/ user preference
    val editionFromHeader = request.headers.get("X-Gu-Edition")

    // NOTE: this only works on dev machines for local testing
    // in production no cookies make it this far
    val editionFromCookie = request.cookies.get("GU_EDITION").map(_.value)

    editionFromParameter
     .orElse(editionFromHeader)
     .orElse(editionFromCookie)
     .getOrElse(defaultEdition.id)
  }

  def apply(request: RequestHeader): Edition = {
    val cookieValue = editionCookieValue(request)
    all.find(_.matchesCookie(cookieValue)).getOrElse(defaultEdition)
  }

  def others(implicit request: RequestHeader): Seq[Edition] = {
      val currentEdition = Edition(request)
      others(currentEdition)
  }

  def others(edition: Edition): Seq[Edition] = all.filterNot(_ == edition)

  def othersById(id: String): Seq[Edition] = byId(id).map(others(_)).getOrElse(Nil)
  def othersByHomepage(path: String): Seq[Edition] = all.find(_.homePagePath == path)
    .map(_.id).map(othersById).getOrElse(Nil)

  def byId(id: String) = all.find(_.id.equalsIgnoreCase(id))

  implicit val editionWrites: Writes[Edition] = new Writes[Edition] {
    def writes(edition: Edition): JsValue = Json.obj("id" -> edition.id)
  }

  implicit val editionReads: Reads[Edition] = {
    (__ \ "id").read[String] map (Edition.byId(_).getOrElse(defaultEdition))
  }

  private lazy val editionRegex = Edition.all.map(_.homePagePath.replaceFirst("/", "")).mkString("|")
  private lazy val EditionalisedFront = s"""^/($editionRegex)$$""".r

  private lazy val EditionalisedId = s"^/($editionRegex)(/[\\w\\d-]+)$$".r


  def otherPagesFor(request: RequestHeader): Seq[EditionLink] = {
    val path = request.path
    val edition = Edition(request)
    path match {
      case EditionalisedId(editionId, section) if Edition.defaultEdition.isEditionalised(section.drop(1)) =>
        val links = Edition.othersById(editionId).map(EditionLink(_, section))
        links.filter(link => link.edition.isEditionalised(link.path.drop(1)))
      case EditionalisedFront(editionId) =>
        Edition.othersByHomepage(path).map(EditionLink(_, "/"))
      case _ => Nil
    }
  }
}

object Editionalise {

  import Edition.defaultEdition


  //TODO - understand RSS

  def apply(id: String, edition: Edition): String = {
    if (edition.isEditionalised(id)) id match {
        case "" => edition.homePagePath.replaceFirst("/", "")
        case _ => s"${edition.id.toLowerCase}/$id"
    } else if (defaultEdition.isEditionalised(id)) {
      s"${defaultEdition.id.toLowerCase}/$id"
    } else {
      id
    }
  }
}

case class EditionLink(edition: Edition, path: String)



object InternationalEdition {

  private val variants = Seq("control", "international")

  def apply(request: RequestHeader): Option[String] = {

    // This is all a bit hacky.
    // we can get rid of it once we are done with the opt-in message.
    val editionIsIntl = request.headers.get("X-GU-Edition").map(_.toLowerCase).contains("intl")
    val editionSetByCookie = request.headers.get("X-GU-Edition-From-Cookie").contains("true")
    val fromInternationalHeader = request.headers.get("X-GU-International").map(_.toLowerCase)
    val setByCookie = request.cookies.get("GU_EDITION").map(_.value.toLowerCase).contains("intl")

    // environments NOT behind the CDN will not have these. In this case assume they are in the
    // "international" bucket
    val noInternationalHeader = request.headers.get("X-GU-International").isEmpty

    if (setByCookie || (editionIsIntl && (editionSetByCookie || noInternationalHeader))) {
      Some("international")
    } else {
      fromInternationalHeader
        .filter(variants.contains(_) && editionIsIntl)
    }
  }
}

object InternationalEditionVariant {

  def apply(request: RequestHeader): Option[String] = request.headers.get("X-GU-International")

}
