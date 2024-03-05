package model.dotcomrendering

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

  "LinkedData.forArticle" should "return news article linkedData" in {
    val linkedData = LinkedData.forArticle(
      article = testArticle,
      baseURL = Configuration.dotcom.baseUrl,
      fallbackLogo = Configuration.images.fallbackLogo,
    )

    // Assert that the newsArticle linkedData list is present
  }
}
