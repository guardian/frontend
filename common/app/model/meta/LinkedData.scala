package model.meta

import conf.Configuration
import model.Article
import play.api.libs.json._
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._
import views.support.{FourByThree, ImgSrc, Item1200, OneByOne}

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
      case re: Review => Json.toJsObject(re)(Review.formats)
    }

    override def reads(json: JsValue): JsResult[LinkedData] = json match {
      case _ => JsError(s"Unexpected attempt to read LinkedData for JSON value $json")
    }
  }

  def toJson(list: LinkedData): String = Json.stringify(Json.toJson(list))

  // Use this to generate structured data for your content
  def apply(article: Article, baseURL: String, fallbackLogo: String): List[LinkedData] = {
    val authors = article.tags.contributors.map(contributor => {
      Person(
        name = contributor.name,
        sameAs = contributor.metadata.webUrl,
      )
    })

    article match {
      case filmReview if article.content.imdb.isDefined && article.tags.isReview => {
        article.content.imdb.toList.map(ref =>
          Review(
            author = authors,
            itemReviewed = SameAs(sameAs = "http://www.imdb.com/title/" + ref),
            reviewRating = article.content.starRating.map(rating =>
              Rating(ratingValue = rating)
            )
          )
        )
      }
      case newsArticle => {
        val mainImageURL = {
          val main = for {
            elem <- article.trail.trailPicture
            master <- elem.masterImage
            url <- master.url
          } yield url

          main.getOrElse(fallbackLogo)
        }

        List(
          NewsArticle(
            `@id` = baseURL + article.metadata.id,
            images = Seq(
              article.content.openGraphImage,
              ImgSrc(mainImageURL, OneByOne),
              ImgSrc(mainImageURL, FourByThree),
              ImgSrc(mainImageURL, Item1200),
            ),
            author = authors,
            datePublished = article.trail.webPublicationDate.toString(),
            dateModified = article.fields.lastModified.toString(),
            headline = article.trail.headline,
            mainEntityOfPage = article.metadata.webUrl,
          ),
          WebPage(
            `@id` = article.metadata.webUrl,
            potentialAction = PotentialAction(target = "android-app://com.guardian/" + article.metadata.webUrl.replace("://", "/"))
          )
        )
      }
    }
  }
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
  ): NewsArticle = NewsArticle(
    `@id` = `@id`,
    image = images,
    author = author,
    headline = headline,
    datePublished = datePublished,
    dateModified = dateModified,
    mainEntityOfPage = mainEntityOfPage,
  )

  implicit val formats: OFormat[NewsArticle] = Json.format[NewsArticle]
}

case class Rating(
  `@type`: String = "Rating",
  `@context`: String = "http://schema.org",
  ratingValue: Int,
  bestRating: Int = 5,
  worstRating: Int = 1,
)

object Rating {
  implicit val formats: OFormat[Rating] = Json.format[Rating]
}

case class SameAs(
  sameAs: String,
)

object SameAs {
  implicit val formats: OFormat[SameAs] = Json.format[SameAs]
}

case class Review(
  `@type`: String = "Review",
 `@context`: String = "http://schema.org",
  publisher: Guardian = Guardian(),
  author: List[Person],
  itemReviewed: SameAs,
  reviewRating: Option[Rating],
) extends LinkedData

object Review {
  implicit val formats: OFormat[Review] = Json.format[Review]
}
