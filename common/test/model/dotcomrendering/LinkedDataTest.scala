package model.dotcomrendering

import com.gu.contentapi.client.model.schemaorg.SchemaRecipe
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
      schemaOrg = Some(SchemaOrg(
        recipe = Some(Seq(SchemaRecipe(
          _atContext = "context",
          _atType = "recipe",
          name = Some("Test recipe"),
          description = Some("This is yummy")
        )))
      )),
    )
    Article.make(Content.make(item))
  }

  "LinkedData.forArticle" should "return news article linkedData" in {
    val linkedData = LinkedData.forArticle(
      article = testArticle,
      baseURL = Configuration.dotcom.baseUrl,
      fallbackLogo = Configuration.images.fallbackLogo,
    )

    linkedData.length shouldEqual(2)
    linkedData.head.`@type` shouldEqual("NewsArticle")
    linkedData(1).`@type` shouldEqual("WebPage")
  }

  "LinkedData.forArticle" should "return recipe linkedData if there is any present" in {
    val linkedData = LinkedData.forArticle(
      article = testArticleWithRecipe,
      baseURL = Configuration.dotcom.baseUrl,
      fallbackLogo = Configuration.images.fallbackLogo
    )

    linkedData.foreach(d=>println(d))
    linkedData.headOption.map(_.`@type`) shouldEqual(Some("NewsArticle"))
    linkedData.length shouldEqual(3)

    println(Json.toJson(linkedData(2)).toString())
  }
}
