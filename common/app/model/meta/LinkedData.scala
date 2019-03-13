package model.meta

import conf.Static
import play.api.libs.json._
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._

sealed trait LinkedData {
  val `@type`: String
  val `@context`: String
}

object LinkedData {

  implicit val formats: OFormat[LinkedData] = new OFormat[LinkedData] {
    override def writes(ld: LinkedData): JsObject = ld match {
      case guardian: Guardian =>  Json.toJsObject(guardian)(Guardian.formats)
      case wp: WebPage => Json.toJsObject(wp)(WebPage.formats)
      case il: ItemList => Json.toJsObject(il)(ItemList.formats)
      case na: NewsArticle => Json.toJsObject(na)(NewsArticle.formats)
    }

    override def reads(json: JsValue): JsResult[LinkedData] = json match {
      case _ => JsError(s"Unexpected attempt to read LinkedData for JSON value $json")
    }
  }

  def toJson(list: LinkedData): String = Json.stringify(Json.toJson(list))
}

case class Logo(
  `@type`: String = "ImageObject",
  url: String = "https://uploads.guim.co.uk/2018/01/31/TheGuardian_AMP.png",
  width: Int = 190,
  height: Int = 60,
)

object Logo {
  implicit val formats: OFormat[Logo] = Json.format[Logo]
}

case class Guardian(
  `@type`: String = "Organization",
  `@context`: String = "https://schema.org",
  `@id`: String = "https://www.theguardian.com#publisher",
  name: String = "The Guardian",
  url: String = "https://www.theguardian.com/",
  logo: Logo = Logo(),
  sameAs: List[String] = List(
    "https://www.facebook.com/theguardian",
    "https://twitter.com/guardian",
    "https://www.youtube.com/user/TheGuardian"
  )
) extends LinkedData

object Guardian {
  implicit val formats: OFormat[Guardian] = Json.format[Guardian]
}

// https://developers.google.com/app-indexing/webmasters/server#schemaorg-markup-for-viewaction
case class WebPage(
  `@type`: String = "WebPage",
  `@context`: String = "https://schema.org",

  `@id`: String,
  potentialAction: PotentialAction
) extends LinkedData

object WebPage {
  implicit val formats: OFormat[WebPage] = Json.format[WebPage]
}

case class PotentialAction(
  `@type`: String = "ViewAction",
  target: String
)

object PotentialAction {
  implicit val formats: OFormat[PotentialAction] = Json.format[PotentialAction]
}

case class ItemList(
  `@context`: String = "https://schema.org",
  `@type`: String = "ItemList",
  url: String,
  itemListElement: Seq[ListItem]
) extends LinkedData

object ItemList {
  implicit val formats: OFormat[ItemList] = Json.format[ItemList]
}

case class ListItem(
  `@type`: String = "ListItem",
  position: Int,
  url: Option[String] = None,// either/or url and item, but needs some care serialising
  item: Option[ItemList] = None
)

object ListItem {

  // We have to do this manually as automatic mapping doesn't seem to
  // work with recursive types unfortunately.
  implicit val listItemFormats: OFormat[ListItem] = (
    (__ \ "@type").format[String] and
      (__ \ "position").format[Int] and
      (__ \ "url").format(Format.optionWithNull[String]) and
      (__ \ "item").lazyFormat(Format.optionWithNull[ItemList])
    )(ListItem.apply, unlift(ListItem.unapply))
}

case class Person(
  `@type`: String = "Person",
  name: String,
  sameAs: String,
)

object Person {
  implicit val formats: OFormat[Person] = Json.format[Person]
}

case class IsPartOf(
  `@type`: List[String] = List("CreativeWork", "Product"),
  name: String = "The Guardian",
  productID: String = "theguardian.com:basic"
)

object IsPartOf {
  implicit val formats: OFormat[IsPartOf] = Json.format[IsPartOf]
}

case class NewsArticle(
  `@type`: String = "NewsArticle",
  `@context`: String = "https://schema.org",
  `@id`: String,
  publisher: Guardian = Guardian(),
  isAccessibleForFree: Boolean = true,
  isPartOf: IsPartOf = IsPartOf(),
  image: Seq[String],
  author: List[Person],
  datePublished: String,
  headline: String,
  dateModified: String,
  mainEntityOfPage: String,
  potentialAction: PotentialAction
) extends LinkedData

object NewsArticle {
  def apply(
    `@id`: String,
    images: Seq[String],
    author: List[Person],
    datePublished: String,
    headline: String,
    dateModified: String,
    mainEntityOfPage: String,
    potentialAction: PotentialAction
  ): NewsArticle = NewsArticle(
    `@id` = `@id`,
    image = images,
    author = author,
    headline = headline,
    datePublished = datePublished,
    dateModified = dateModified,
    mainEntityOfPage = mainEntityOfPage,
    potentialAction = potentialAction
  )

  implicit val formats: OFormat[NewsArticle] = Json.format[NewsArticle]
}
