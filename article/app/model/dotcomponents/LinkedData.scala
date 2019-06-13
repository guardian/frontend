package model.dotcomponents

import java.net.URI

import com.gu.contentapi.client.model.v1.{Block => CAPIBlock}
import conf.Configuration
import model.{Article, LiveBlogPage}
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json._
import views.support.{FourByThree, ImgSrc, Item1200, OneByOne}

import scala.util.Try

object LinkedData {

  implicit val formats: OFormat[LinkedData] = new OFormat[LinkedData] {
    override def writes(ld: LinkedData): JsObject = ld match {
      case guardian: Guardian =>  Json.toJsObject(guardian)(Guardian.formats)
      case wp: WebPage => Json.toJsObject(wp)(WebPage.formats)
      case il: ItemList => Json.toJsObject(il)(ItemList.formats)
      case na: NewsArticle => Json.toJsObject(na)(NewsArticle.formats)
      case re: Review => Json.toJsObject(re)(Review.formats)
      case lb: LiveBlogPosting => Json.toJsObject(lb)(LiveBlogPosting.formats)
      case po: BlogPosting => Json.toJsObject(po)(BlogPosting.formats)
    }

    override def reads(json: JsValue): JsResult[LinkedData] = json match {
      case _ => JsError(s"Unexpected attempt to read LinkedData for JSON value $json")
    }
  }

  def forLiveblog(
    liveblog: LiveBlogPage,
    blocks: Seq[CAPIBlock],
    baseURL: String,
    fallbackLogo: String
  ): List[LinkedData] = {

    def dtFmt(date: DateTime): String = date.toString(
      DateTimeFormat.forPattern("yyyy-MM-dd'T'HH:mm:ssZ")
        .withZoneUTC()
    )

    val article = liveblog.article

    val authors = article.tags.contributors.map(contributor => {
      Person(
        name = contributor.name,
        sameAs = contributor.metadata.webUrl,
      )
    })

    List(
      LiveBlogPosting(
        `@id` = baseURL + article.metadata.id,
        image = getImages(article, fallbackLogo),
        author = authors,
        datePublished = article.trail.webPublicationDate.toString(),
        dateModified = article.fields.lastModified.toString(),
        headline = article.trail.headline,
        mainEntityOfPage = article.metadata.webUrl,
        coverageStartTime = dtFmt(article.trail.webPublicationDate),
        coverageEndTime = dtFmt(article.fields.lastModified),
        liveBlogUpdate = blocks.map(block => {
          BlogPosting(
            `@id` = block.id,
            image = getImages(article, fallbackLogo),
            author = authors,
            datePublished = article.trail.webPublicationDate.toString(),
            dateModified = article.fields.lastModified.toString(),
            headline = article.trail.headline,
            mainEntityOfPage = article.metadata.webUrl,
            articleBody = BlogPosting.summary(block),
          )
        })
      ),
      WebPage(
        `@id` = article.metadata.webUrl,
        potentialAction = PotentialAction(target = "android-app://com.guardian/" + article.metadata.webUrl.replace("://", "/"))
      )
    )
  }

  def forArticle(
    article: Article,
    baseURL: String,
    fallbackLogo: String
  ): List[LinkedData] = {

    val authors = getAuthors(article)

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
        List(
          NewsArticle(
            `@id` = baseURL + article.metadata.id,
            image = getImages(article, fallbackLogo),
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

  private[this] def getImages(article: Article, fallbackLogo: String): List[String] = {
    def usesImageServiceHost(url: String): Boolean = {
      Try(new URI(url.trim)).toOption.exists(_.getHost == Configuration.images.host)
    }

    // Check if not image service, as if so then we can't guarantee it is big enough
    // for SEO validation purposes so we use a fallback
    if (usesImageServiceHost(article.content.openGraphImage)) {
      List(article.content.openGraphImage)
    } else {
      List(ImgSrc(fallbackLogo, Item1200))
    }
  }

  def getAuthors(article: Article): List[Person] = {
    article.tags.contributors.map(contributor => {
      Person(
        name = contributor.name,
        sameAs = contributor.metadata.webUrl,
      )
    })
  }
}

sealed trait LinkedData {
  val `@type`: String
  val `@context`: String
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

trait ArticleMeta {
  def publisher: Guardian
  def datePublished: String
  def dateModified: String
  def image: Seq[String]
  def headline: String
  def mainEntityOfPage: String

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
) extends LinkedData with ArticleMeta

object NewsArticle {
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

case class BlogPosting(
  `@type`: String = "BlogPosting",
  `@context`: String = "http://schema.org",
  `@id`: String,
  publisher: Guardian = Guardian(),
  isAccessibleForFree: Boolean = true,
  image: Seq[String],
  author: List[Person],
  datePublished: String,
  headline: String,
  dateModified: String,
  mainEntityOfPage: String,
  articleBody: String,
) extends LinkedData with ArticleMeta

object BlogPosting {
  implicit val formats: OFormat[BlogPosting] = Json.format[BlogPosting]

  def summary(block: CAPIBlock): String = {
    if(block.bodyTextSummary.length < 1000){
      block.bodyTextSummary
    } else {
      block.bodyTextSummary.substring(0, 1000)
    }
  }
}

case class LiveBlogPosting(
  `@type`: String = "LiveBlogPosting",
  `@context`: String = "http://schema.org",
  `@id`: String,
  publisher: Guardian = Guardian(),
  isAccessibleForFree: Boolean = true,
  image: Seq[String],
  author: List[Person],
  datePublished: String,
  headline: String,
  dateModified: String,
  mainEntityOfPage: String,
  coverageStartTime: String,
  coverageEndTime: String,
  liveBlogUpdate: Seq[BlogPosting]
) extends LinkedData with ArticleMeta

object LiveBlogPosting {
  implicit val formats: OFormat[LiveBlogPosting] = Json.format[LiveBlogPosting]

}
