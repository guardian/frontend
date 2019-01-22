package model.meta

import conf.Static
import play.api.libs.json._

class LinkedData(
  val `@type`: String,
  val `@context`: String = "http://schema.org")

object LinkedData {

  import org.json4s._
  import org.json4s.native.Serialization.write

  implicit val formats = DefaultFormats + FieldSerializer[LinkedData]()

  def toJson(list: LinkedData): String = write(list)
}

case class Guardian(
  override val `@type`: String = "Organization",
  override val `@context`: String = "http://schema.org",
  name: String = "The Guardian",
  url: String = "http://www.theguardian.com/",
  logo: String = Static("images/favicons/152x152.png"),
  sameAs: List[String] = List(
    "https://www.facebook.com/theguardian",
    "https://twitter.com/guardian",
    "https://www.youtube.com/user/TheGuardian"
  )
) extends LinkedData(`@type`, `@context`)

object Guardian {
  implicit val formats: OFormat[Guardian] = Json.format[Guardian]
}

// https://developers.google.com/app-indexing/webmasters/server#schemaorg-markup-for-viewaction
case class WebPage(
  `@id`: String,
  potentialAction: PotentialAction
) extends LinkedData("WebPage")

case class PotentialAction(
  `@type`: String = "ViewAction",
  target: String
)

object PotentialAction {
  implicit val formats: OFormat[PotentialAction] = Json.format[PotentialAction]
}

case class ItemList(
  url: String,
  itemListElement: Seq[ListItem]
) extends LinkedData("ItemList")

case class ListItem(
  `@type`: String = "ListItem",
  position: Int,
  url: Option[String] = None,// either/or url and item, but needs some care serialising
  item: Option[ItemList] = None
)
