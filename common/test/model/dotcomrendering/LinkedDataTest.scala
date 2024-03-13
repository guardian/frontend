package model.dotcomrendering

import com.gu.contentapi.client.model.schemaorg.{RecipeStep, SchemaRecipe}
import com.gu.contentapi.client.model.v1.{CapiDateTime, SchemaOrg, Tag, TagType, Content => ApiContent}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import model.{Article, Content, ContentType, DotcomContentType, MetaData, RelatedContent}
import conf.Configuration
import org.mockito.Mockito.when
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import test.{TestRequest, WithTestExecutionContext}
import org.joda.time.{DateTime, DateTimeZone}

import java.time.ZoneOffset
import implicits.Dates.jodaToJavaInstant
import play.api.libs.json.Json

class LinkedDataTest extends AnyFlatSpec with Matchers with MockitoSugar {

  // TODO - Add test schema org data here
  //
  //  val testSchemaOrg: SchemaOrg = {
  //      recipe: [
  //    ]
  //  }
  //
  //  val testRecipe

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
    """{"@context":"http://schema.org","@type":"Recipe","name":"Test recipe","description":"This is yummy","image":"https://path.to/image/on/server.jpg","datePublished":"2012-01-02T03:04:05Z","url":"https://path.to/content/on/server.html","recipeCategory":["test","food"],"recipeCuisine":["test","British"],"recipeIngredient":["23 litres of sprunge","6 baked beans"],"recipeInstructions":[{"@type":"HowToStep","text":"Open the can","name":"Open"},{"@type":"HowToStep","text":"Pour the contents","name":"Pour"}],"recipeYield":["1 serving"],"prepTime":"30 seconds","cookTime":"10 hours","totalTime":"10 hours 30 seconds","author":{"@type":"Person","name":"John Smith"}},"suitableForDiet":["https://schema.org/VeganDiet","https://schema.org/VegetarianDiet"]}"""

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
