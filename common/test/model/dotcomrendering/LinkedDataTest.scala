package model.dotcomrendering

import com.gu.contentapi.client.model.schemaorg.{RecipeStep, SchemaOrg, SchemaRecipe}
import com.gu.contentapi.client.model.v1.{ContentFields, TagType, Content => ApiContent, Tag => ApiTag}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import model.{Article, Content, SimpleContentPage}
import conf.Configuration
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import org.joda.time.DateTime

import java.time.ZoneOffset
import implicits.Dates.jodaToJavaInstant
import play.api.libs.json.Json

class LinkedDataTest extends AnyFlatSpec with Matchers with MockitoSugar {

  val publishDate = Some(jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC).toCapiDateTime)

  val testArticle = {
    val item = ApiContent(
      id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDate = publishDate,
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(),
      elements = None,
      schemaOrg = None,
    )
    Article.make(Content.make(item))
  }

  val testArticleWithRecipe = {
    val item = ApiContent(
      id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDate = publishDate,
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(),
      elements = None,
      schemaOrg = Some(
        SchemaOrg(
          recipe = Some(
            Seq(
              SchemaRecipe(
                _atContext = "http://schema.org",
                _atType = "Recipe",
                name = Some("Test recipe"),
                description = Some("This is yummy"),
                image = Some("https://path.to/image/on/server.jpg"),
                datePublished = Some("2012-01-02T03:04:05Z"),
                url = Some("https://path.to/content/on/server.html"),
                recipeCategory = Some(Seq("test", "food")),
                recipeCuisine = Some(Seq("test", "British")),
                recipeIngredient = Some(Seq("23 litres of sprunge", "6 baked beans")),
                recipeInstructions = Some(
                  Seq(
                    RecipeStep(
                      _atType = "HowToStep",
                      text = "Open the can",
                      name = Some("Open"),
                      url = None,
                      image = None,
                    ),
                    RecipeStep(
                      _atType = "HowToStep",
                      text = "Pour the contents",
                      name = Some("Pour"),
                      url = None,
                      image = None,
                    ),
                  ),
                ),
                recipeYield = Some(Seq("1 serving")),
                prepTime = Some("30 seconds"),
                cookTime = Some("10 hours"),
                totalTime = Some("10 hours 30 seconds"),
                author = Some(
                  com.gu.contentapi.client.model.schemaorg
                    .AuthorInfo(_atType = "Person", name = "John Smith", sameAs = None),
                ),
                suitableForDiet = Some(Seq("https://schema.org/VeganDiet", "https://schema.org/VegetarianDiet")),
              ),
            ),
          ),
        ),
      ),
    )
    Article.make(Content.make(item))
  }

  /// This string should always correct validate at https://validator.schema.org/
  val expectedRecipeJson =
    """{"@context":"http://schema.org","@type":"Recipe","name":"Test recipe","description":"This is yummy","image":"https://path.to/image/on/server.jpg","datePublished":"2012-01-02T03:04:05Z","url":"https://path.to/content/on/server.html","recipeCategory":["test","food"],"recipeCuisine":["test","British"],"recipeIngredient":["23 litres of sprunge","6 baked beans"],"recipeInstructions":[{"@type":"HowToStep","text":"Open the can","name":"Open"},{"@type":"HowToStep","text":"Pour the contents","name":"Pour"}],"recipeYield":["1 serving"],"prepTime":"30 seconds","cookTime":"10 hours","totalTime":"10 hours 30 seconds","author":{"@type":"Person","name":"John Smith"},"suitableForDiet":["https://schema.org/VeganDiet","https://schema.org/VegetarianDiet"]}"""

  "LinkedData.forArticle" should "return news article linkedData" in {
    val linkedData = LinkedData.forArticle(
      article = testArticle,
      baseURL = Configuration.dotcom.baseUrl,
      fallbackLogo = Configuration.images.fallbackLogo,
    )

    linkedData.length shouldEqual (2)
    linkedData.head.`@type` shouldEqual ("NewsArticle")
    linkedData(1).`@type` shouldEqual ("WebPage")
  }

  it should "align JSON-LD and Open Graph modification dates only for republished UK and US Filter articles" in {
    val published = new DateTime("2026-10-07T16:13:00Z")
    val firstPublished = published.minusDays(5)
    val lastModified = published.plusMinutes(10)
    def capi(date: DateTime) = jodaToJavaInstant(date).atOffset(ZoneOffset.UTC).toCapiDateTime

    Seq(
      "thefilter/series/the-filter",
      "thefilter-us/series/thefilter-us",
      "tracking/commissioningdesk/the-filter",
      "tracking/commissioningdesk/filter-us",
      "lifeandstyle/lifeandstyle",
    ).foreach { tagId =>
      val item = ApiContent(
        id = "thefilter/2026/oct/02/test-article",
        sectionId = None,
        sectionName = None,
        webPublicationDate = Some(capi(published)),
        webTitle = "Test article",
        webUrl = "https://www.theguardian.com/thefilter/2026/oct/02/test-article",
        apiUrl = "https://content.guardianapis.com/thefilter/2026/oct/02/test-article",
        tags = List(
          ApiTag(
            id = tagId,
            `type` = TagType.Keyword,
            webTitle = "",
            sectionId = None,
            sectionName = None,
            webUrl = "",
            apiUrl = "",
            references = Nil,
          ),
        ),
        fields = Some(
          ContentFields(
            firstPublicationDate = Some(capi(firstPublished)),
            lastModified = Some(capi(lastModified)),
          ),
        ),
      )
      val article = Article.make(Content.make(item))
      val linkedData = LinkedData.forArticle(article, Configuration.dotcom.baseUrl, Configuration.images.fallbackLogo)
      val json = Json.toJson(linkedData.head)
      val expectedModified =
        if (tagId == "lifeandstyle/lifeandstyle") article.fields.lastModified else article.trail.webPublicationDate

      (json \ "dateModified").as[String] shouldEqual expectedModified.toString()
      (json \ "datePublished").as[String] shouldEqual article.trail.webPublicationDate.toString()
      val openGraph = SimpleContentPage(article).getOpenGraphProperties
      openGraph("article:modified_time") shouldEqual expectedModified.toString()
      openGraph("article:published_time") shouldEqual article.trail.webPublicationDate.toString()
    }
  }

  it should "keep lastModified as dateModified for a Filter article that has not been republished" in {
    val published = new DateTime("2026-10-07T16:13:00Z")
    val lastModified = published.plusMinutes(10)
    def capi(date: DateTime) = jodaToJavaInstant(date).atOffset(ZoneOffset.UTC).toCapiDateTime

    val item = ApiContent(
      id = "thefilter/2026/oct/07/test-article",
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(capi(published)),
      webTitle = "Test article",
      webUrl = "https://www.theguardian.com/thefilter/2026/oct/07/test-article",
      apiUrl = "https://content.guardianapis.com/thefilter/2026/oct/07/test-article",
      tags = List(
        ApiTag(
          id = "thefilter/series/the-filter",
          `type` = TagType.Keyword,
          webTitle = "",
          sectionId = None,
          sectionName = None,
          webUrl = "",
          apiUrl = "",
          references = Nil,
        ),
      ),
      fields = Some(
        ContentFields(
          firstPublicationDate = Some(capi(published)),
          lastModified = Some(capi(lastModified)),
        ),
      ),
    )
    val article = Article.make(Content.make(item))
    val linkedData = LinkedData.forArticle(article, Configuration.dotcom.baseUrl, Configuration.images.fallbackLogo)
    val json = Json.toJson(linkedData.head)

    (json \ "dateModified").as[String] shouldEqual article.fields.lastModified.toString()
    (json \ "datePublished").as[String] shouldEqual article.trail.webPublicationDate.toString()
    val openGraph = SimpleContentPage(article).getOpenGraphProperties
    openGraph("article:modified_time") shouldEqual article.fields.lastModified.toString()
    openGraph("article:published_time") shouldEqual article.trail.webPublicationDate.toString()
  }

  "LinkedData.forArticle" should "return recipe linkedData if there is any present" in {
    val linkedData = LinkedData.forArticle(
      article = testArticleWithRecipe,
      baseURL = Configuration.dotcom.baseUrl,
      fallbackLogo = Configuration.images.fallbackLogo,
    )

    linkedData.foreach(d => println(d))
    linkedData.length shouldEqual (3)
    linkedData.head.`@type` shouldEqual ("NewsArticle")
    linkedData(1).`@type` shouldEqual ("WebPage")

    val jsonString = Json.toJson(linkedData(2)).toString()
    println(jsonString)
    jsonString shouldEqual (expectedRecipeJson)
  }
}
