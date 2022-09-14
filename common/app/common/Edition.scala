package common

import navigation.EditionNavLinks

import java.util.Locale
import org.joda.time.DateTimeZone
import play.api.libs.json._
import play.api.mvc.RequestHeader
import experiments.{ActiveExperiments, EuropeNetworkFront}

import java.time.ZoneId

// describes the ways in which editions differ from each other
abstract class Edition(
    val id: String,
    val displayName: String,
    val timezone: DateTimeZone,
    val locale: Option[Locale],
    val networkFrontId: String,
    val editionalisedSections: Seq[String] = Seq(
      "", // network front
      "business",
      "business-to-business",
      "commentisfree",
      "culture",
      "money",
      "sport",
      "sustainable-business",
      "technology",
      "media",
      "environment",
      "film",
      "lifeandstyle",
      "travel",
      "tv-and-radio",
    ),
    val navigationLinks: EditionNavLinks,
) {
  val homePagePath: String = s"/$networkFrontId"

  def isEditionalised(id: String): Boolean = editionalisedSections.contains(id)
  def matchesCookie(cookieValue: String): Boolean = id.equalsIgnoreCase(cookieValue)
  def timezoneId = ZoneId.of(timezone.getID)
}

object Edition {
  // gives templates an implicit edition
  implicit def edition(implicit request: RequestHeader): Edition = this(request)

  lazy val defaultEdition: Edition = editions.Uk
  def editionsByRequest(implicit request: RequestHeader): List[Edition] = {
    val participatingInTest = ActiveExperiments.isParticipating(EuropeNetworkFront)
    if (!participatingInTest) all else allWithBetaEditions
  }

  lazy val all = List(
    editions.Uk,
    editions.Us,
    editions.Au,
    editions.International,
  )

  lazy val allWithBetaEditions = all ++ List(editions.Europe)

  lazy val localeByEdition: Map[Edition, Locale] =
    (for {
      edition <- allWithBetaEditions
      locale <- edition.locale
    } yield edition -> locale).toMap

  private def editionFromRequest(request: RequestHeader): String = {
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
    val cookieValue = editionFromRequest(request)
    editionsByRequest(request).find(_.matchesCookie(cookieValue)).getOrElse(defaultEdition)
  }

  def others(implicit request: RequestHeader): Seq[Edition] = {
    val currentEdition = Edition(request)
    editionsByRequest(request).filterNot(_ == currentEdition)
  }

  def othersWithBetaEditions(edition: Edition): Seq[Edition] = allWithBetaEditions.filterNot(_ == edition)

  def byId(id: String): Option[Edition] = allWithBetaEditions.find(_.id.equalsIgnoreCase(id))
  def byNetworkFrontId(id: String): Option[Edition] = allWithBetaEditions.find(_.networkFrontId == id)

  implicit val editionWrites: Writes[Edition] = new Writes[Edition] {
    def writes(edition: Edition): JsValue = Json.obj("id" -> edition.id)
  }

  implicit val editionReads: Reads[Edition] = {
    (__ \ "id").read[String] map (Edition.byId(_).getOrElse(defaultEdition))
  }

  lazy val editionRegex = Edition.allWithBetaEditions.map(_.homePagePath.replaceFirst("/", "")).mkString("|")
  private lazy val EditionalisedFront = s"""^/($editionRegex)$$""".r

  private lazy val EditionalisedId = s"^/($editionRegex)(/[\\w\\d-]+)$$".r

  def allPagesFor(request: RequestHeader): Seq[EditionLink] = {
    val path = request.path
    path match {
      case EditionalisedId(id, section)
          if Edition.defaultEdition
            .isEditionalised(section.drop(1)) && Edition.byNetworkFrontId(id).exists(_.locale.isDefined) =>
        val links = for {
          (edition, locale) <- localeByEdition.toSeq
        } yield EditionLink(edition, section, locale)
        links.filter(link => link.edition.isEditionalised(link.path.drop(1)))
      case EditionalisedFront(networkFrontId) if Edition.byNetworkFrontId(networkFrontId).exists(_.locale.isDefined) =>
        for {
          (edition, locale) <- localeByEdition.toSeq
        } yield EditionLink(edition, "/", locale)
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
      case _  => s"${edition.id.toLowerCase}/$id"
    }
    else if (defaultEdition.isEditionalised(id)) {
      s"${defaultEdition.id.toLowerCase}/$id"
    } else {
      id
    }
  }
}

case class EditionLink(edition: Edition, path: String, locale: Locale)

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
