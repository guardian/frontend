package model.dotcomrendering

import com.gu.contentapi.client.model.schemaorg.SchemaRecipe
import com.gu.contentapi.client.model.v1.{Block => CAPIBlock}
import model.{Article, ContentType, ImageMedia, Interactive, LiveBlogPage, Tags}
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json._
import views.support.{FourByThree, ImgSrc, Item1200, OneByOne}

import scala.util.matching.Regex

object LinkedData {

  implicit val formats: OFormat[LinkedData] = new OFormat[LinkedData] {
    override def writes(ld: LinkedData): JsObject =
      ld match {
        case guardian: Guardian   => Json.toJsObject(guardian)(Guardian.formats)
        case wp: WebPage          => Json.toJsObject(wp)(WebPage.formats)
        case il: ItemList         => Json.toJsObject(il)(ItemList.formats)
        case na: NewsArticle      => Json.toJsObject(na)(NewsArticle.formats)
        case re: Review           => Json.toJsObject(re)(Review.formats)
        case lb: LiveBlogPosting  => Json.toJsObject(lb)(LiveBlogPosting.formats)
        case po: BlogPosting      => Json.toJsObject(po)(BlogPosting.formats)
        case rp: RecipeLinkedData => Json.toJsObject(rp)(RecipeLinkedData.formats)
      }

    override def reads(json: JsValue): JsResult[LinkedData] =
      json match {
        case _ => JsError(s"Unexpected attempt to read LinkedData for JSON value $json")
      }
  }

  def forLiveblog(
      liveblog: LiveBlogPage,
      blocks: Seq[CAPIBlock],
      baseURL: String,
      fallbackLogo: String,
  ): List[LinkedData] = {

    def dtFmt(date: DateTime): String =
      date.toString(
        DateTimeFormat
          .forPattern("yyyy-MM-dd'T'HH:mm:ssZ")
          .withZoneUTC(),
      )

    val article = liveblog.article
    val authors = getAuthors(article.tags)

    List(
      LiveBlogPosting(
        `@id` = baseURL + "/" + article.metadata.id,
        image = getImagesForArticle(article, fallbackLogo),
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
            image = getImagesForArticle(article, fallbackLogo),
            author = authors,
            datePublished = article.trail.webPublicationDate.toString(),
            dateModified = article.fields.lastModified.toString(),
            headline = article.trail.headline,
            mainEntityOfPage = article.metadata.webUrl,
            articleBody = BlogPosting.summary(block),
          )
        }),
      ),
      WebPage(
        `@id` = article.metadata.webUrl,
        potentialAction =
          Some(PotentialAction(target = "android-app://com.guardian/" + article.metadata.webUrl.replace("://", "/"))),
      ),
    )
  }

  def forArticle(
      article: ContentType,
      baseURL: String,
      fallbackLogo: String,
  ): List[LinkedData] = {
    val authors = getAuthors(article.tags)

    val articleLinkedData: List[LinkedData] = List(
      NewsArticle(
        `@id` = baseURL + "/" + article.metadata.id,
        image = getImagesForArticle(article, fallbackLogo),
        author = authors,
        datePublished = article.trail.webPublicationDate.toString(),
        dateModified = article.fields.lastModified.toString(),
        headline = article.trail.headline,
        mainEntityOfPage = article.metadata.webUrl,
      ),
      WebPage(
        `@id` = article.metadata.webUrl,
        potentialAction = Some(
          PotentialAction(target = "android-app://com.guardian/" + article.metadata.webUrl.replace("://", "/")),
        ),
      ),
    )

    article match {
      case filmReview if article.content.imdb.isDefined && article.tags.isReview => {
        article.content.imdb.toList.map(ref =>
          Review(
            author = authors,
            itemReviewed = SameAs(sameAs = "http://www.imdb.com/title/" + ref),
            reviewRating = article.content.starRating.map(rating => Rating(ratingValue = rating)),
          ),
        )
      }
      // We need to convert the Seq[SchemaRecipe] to List[Recipe] (to satisfy type match of List[LinkedData]
      case recipeArticle if article.content.schemaOrg.flatMap(_.recipe).getOrElse(Seq()).nonEmpty =>
        val recipes = recipeArticle.content.schemaOrg.flatMap(_.recipe).getOrElse(Seq())
        articleLinkedData ++ recipes.map(RecipeLinkedData.apply)
      case _ => articleLinkedData
    }
  }

  def forInteractive(
      interactive: Interactive,
      baseURL: String,
      fallbackLogo: String,
  ): List[LinkedData] = {
    val authors = getAuthors(interactive.tags)

    List(
      NewsArticle(
        `@id` = baseURL + "/" + interactive.metadata.id,
        image = getImagesForInteractive(interactive, fallbackLogo),
        author = authors,
        datePublished = interactive.trail.webPublicationDate.toString(),
        dateModified = interactive.fields.lastModified.toString(),
        headline = interactive.trail.headline,
        mainEntityOfPage = interactive.metadata.webUrl,
      ),
      WebPage(
        `@id` = interactive.metadata.webUrl,
        potentialAction = Some(
          PotentialAction(target = "android-app://com.guardian/" + interactive.metadata.webUrl.replace("://", "/")),
        ),
      ),
    )
  }

  private[this] def getImagesForArticle(
      article: ContentType,
      fallbackLogo: String,
  ): List[String] = getImages(article.trail.trailPicture, article.content.openGraphImage, fallbackLogo)

  private[this] def getImagesForInteractive(
      article: Interactive,
      fallbackLogo: String,
  ): List[String] = getImages(article.trail.trailPicture, article.content.openGraphImage, fallbackLogo)

  private[this] def getImages(
      trailPicture: Option[ImageMedia],
      openGraphImage: String,
      fallbackLogo: String,
  ): List[String] = {
    val mainImageURL = {
      val main = for {
        elem <- trailPicture
        master <- elem.masterImage
        url <- master.url
      } yield url

      main.getOrElse(fallbackLogo)
    }

    // If gif, use fallback. This is because Fastly does not support upscaling on
    // gif images so we can't guarantee they will be large enough to pass Google
    // structured data requirements (1200px). This should affect very few
    // articles in practice.
    val preferredOpenGraphImage = {
      val preferred = openGraphImage
      if (preferred.endsWith(".gif")) ImgSrc(fallbackLogo, Item1200)
      else preferred
    }

    List(
      preferredOpenGraphImage,
      ImgSrc(mainImageURL, OneByOne),
      ImgSrc(mainImageURL, FourByThree),
      ImgSrc(mainImageURL, Item1200),
    )
  }

  def getAuthors(tags: Tags): List[Person] = {
    val authors = tags.contributors.map(contributor => {
      Person(
        name = contributor.name,
        sameAs = Some(contributor.metadata.webUrl),
      )
    })

    authors match {
      case Nil => List(Person(name = "Guardian staff reporter", sameAs = None))
      case _   => authors
    }
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
      "https://www.youtube.com/user/TheGuardian",
    ),
) extends LinkedData

object Guardian {
  implicit val formats: OFormat[Guardian] = Json.format[Guardian]
}

// https://developers.google.com/app-indexing/webmasters/server#schemaorg-markup-for-viewaction
case class WebPage(
    `@type`: String = "WebPage",
    `@context`: String = "https://schema.org",
    `@id`: String,
    potentialAction: Option[PotentialAction] = None,
) extends LinkedData

object WebPage {
  implicit val formats: OFormat[WebPage] = Json.format[WebPage]
}

case class PotentialAction(
    `@type`: String = "ViewAction",
    target: String,
)

object PotentialAction {
  implicit val formats: OFormat[PotentialAction] = Json.format[PotentialAction]
}

case class ItemList(
    `@context`: String = "https://schema.org",
    `@type`: String = "ItemList",
    url: String,
    itemListElement: Seq[ListItem],
) extends LinkedData

object ItemList {
  implicit val formats: OFormat[ItemList] = Json.format[ItemList]
}

case class ListItem(
    `@type`: String = "ListItem",
    position: Int,
    url: Option[String] = None, // either/or url and item, but needs some care serialising
    item: Option[ItemList] = None,
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
    sameAs: Option[String],
)

object Person {
  implicit val formats: OFormat[Person] = Json.format[Person]
}

case class IsPartOf(
    `@type`: List[String] = List("CreativeWork", "Product"),
    name: String = "The Guardian",
    productID: String = "theguardian.com:basic",
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
) extends LinkedData
    with ArticleMeta

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
) extends LinkedData
    with ArticleMeta

object BlogPosting {
  implicit val formats: OFormat[BlogPosting] = Json.format[BlogPosting]

  def summary(block: CAPIBlock): String = {
    if (block.bodyTextSummary.length < 1000) {
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
    liveBlogUpdate: Seq[BlogPosting],
) extends LinkedData
    with ArticleMeta

object LiveBlogPosting {
  implicit val formats: OFormat[LiveBlogPosting] = Json.format[LiveBlogPosting]

}

case class RecipeLinkedData(
    `@type`: String = "Recipe",
    `@context`: String = "http://schema.org",
    content: SchemaRecipe,
) extends LinkedData

object RecipeLinkedData {
  /*
  What's all this about? Well, schema.org relies on fields prefixed with the `@` symbol as internal type discriminators.
  Unfortunately, if we generate the schema.org upstream in Concierge we need to format it into Thrift to be passed into Frontend.
  Thrift objects to the usage of the `@` symbol in field names.... so instead of `@type` we had to pass `_atType`.
  When we render it back out to JSON, though, we need to replace the `_at` prefix with `@` (and fix the case of the first char).
  This is done by defining a custom naming scheme in Play json - see https://www.playframework.com/documentation/3.0.x/ScalaJsonAutomated#Implementing-your-own-Naming-Strategy
  for more details.
  The scheme is defined by the `SchemaOrgNaming` static object, which is effectively a filter for every field name as it is serialized.
  That's then wired into the formatter by overriding the implicit `JsonConfiguration` object _before_ defining the implicit formatters below -
  as a result, _anything_ with the `@` prefix gets fixed
   */
  object SchemaOrgNaming extends JsonNaming {
    private val atField = "^_at(\\w)(.*)$".r
    override def apply(property: String): String =
      property match {
        case atField(leadingChar, tail) => s"@${leadingChar.toLowerCase}$tail"
        case _                          => property
      }
  }

  implicit val config: JsonConfiguration = JsonConfiguration(SchemaOrgNaming)

  implicit val authorInfo: OFormat[com.gu.contentapi.client.model.schemaorg.AuthorInfo] =
    Json.format[com.gu.contentapi.client.model.schemaorg.AuthorInfo]

  implicit val schemaRecipeStep: OFormat[com.gu.contentapi.client.model.schemaorg.RecipeStep] =
    Json.format[com.gu.contentapi.client.model.schemaorg.RecipeStep]
  implicit val schemaFormat: OFormat[SchemaRecipe] = Json.format[SchemaRecipe]

  /*
  We define a manual formatter write here, just in order to be able to have a case class which simultaneously satisfies
  the `LinkedData` trait but also contains the entire schema.org object with the funkily named fields and can be serialized
  directly into valid schema.org json
   */
  implicit val formats: OFormat[RecipeLinkedData] = new OFormat[RecipeLinkedData] {
    def writes(d: RecipeLinkedData) =
      Json.obj(
        "@context" -> d.`@context`,
        "@type" -> d.`@type`,
        "name" -> d.content.name,
        "description" -> d.content.description,
        "image" -> d.content.image,
        "datePublished" -> d.content.datePublished,
        "url" -> d.content.url,
        "recipeCategory" -> d.content.recipeCategory,
        "recipeCuisine" -> d.content.recipeCuisine,
        "recipeIngredient" -> d.content.recipeIngredient,
        "recipeInstructions" -> d.content.recipeInstructions,
        "recipeYield" -> d.content.recipeYield,
        "prepTime" -> d.content.prepTime,
        "cookTime" -> d.content.cookTime,
        "totalTime" -> d.content.totalTime,
        "author" -> d.content.author,
        "suitableForDiet" -> d.content.suitableForDiet,
      )

    override def reads(json: JsValue): JsResult[RecipeLinkedData] =
      throw new RuntimeException("Unexpected attempt to read RecipeLinkedData")
  }

  def apply(from: SchemaRecipe) =
    new RecipeLinkedData(`@type` = from._atType, `@context` = from._atContext, content = from)
}
