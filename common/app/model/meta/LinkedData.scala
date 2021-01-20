package model.meta

import play.api.libs.json.{Json, OFormat}

class LinkedData(val `@type`: String, val `@context`: String = "http://schema.org")

object LinkedData {

  import org.json4s._
  import org.json4s.native.Serialization.write

  implicit val formats = DefaultFormats + FieldSerializer[LinkedData]()

  def toJson(list: LinkedData): String = write(list)
}

case class Guardian(
    name: String = "The Guardian",
    url: String = "http://www.theguardian.com/",
    logo: Logo = Logo(),
    sameAs: List[String] = List(
      "https://www.facebook.com/theguardian",
      "https://twitter.com/guardian",
      "https://www.youtube.com/user/TheGuardian",
    ),
) extends LinkedData("Organization")

// https://developers.google.com/app-indexing/webmasters/server#schemaorg-markup-for-viewaction
case class WebPage(
    `@id`: String,
    potentialAction: PotentialAction,
) extends LinkedData("WebPage")

case class PotentialAction(
    `@type`: String = "ViewAction",
    target: String,
)

case class ItemList(
    url: String,
    itemListElement: Seq[ListItem],
) extends LinkedData("ItemList")

case class ListItem(
    `@type`: String = "ListItem",
    position: Int,
    url: Option[String] = None, // either/or url and item, but needs some care serialising
    item: Option[ItemList] = None,
)

case class Logo(
    `@type`: String = "ImageObject",
    url: String = "https://uploads.guim.co.uk/2018/01/31/TheGuardian_AMP.png",
    width: Int = 190,
    height: Int = 60,
)

object Logo {
  implicit val formats: OFormat[Logo] = Json.format[Logo]
}
