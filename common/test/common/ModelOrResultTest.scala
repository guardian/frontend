package common

import java.time.ZoneOffset

import com.gu.contentapi.client.model.v1.{Content, ItemResponse, Section, Tag, TagType}
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import play.api.mvc.RequestHeader
import play.api.test.Helpers._
import test.{TestRequest, WithTestExecutionContext}
import implicits.Dates.jodaToJavaInstant
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime

import scala.concurrent.Future

private object TestModel

class ModelOrResultTest extends FlatSpec with Matchers with WithTestExecutionContext {

  val offsetDate = jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC)

  implicit val request: RequestHeader = TestRequest()

  val testContent = Content(id = "the/id",
    sectionId = None,
    sectionName = None,
    webPublicationDate = Some(offsetDate.toCapiDateTime),
    webTitle = "the title",
    webUrl = "http://www.guardian.co.uk/canonical",
    apiUrl = "http://foo.bar",
    elements = None)

  val articleTag = Tag(
    id = "type/article",
    `type` = TagType.Type,
    webTitle = "the title",
    webUrl = "http://foo.bar",
    apiUrl = "http://foo.bar")

  val galleryTag = articleTag.copy(id = "type/gallery")
  val videoTag = articleTag.copy(id = "type/video")
  val audioTag = articleTag.copy(id = "type/audio")

  val testArticle = testContent.copy(tags = List(articleTag))
  val testGallery = testContent.copy(tags = List(galleryTag))
  val testVideo = testContent.copy(tags = List(videoTag))
  val testAudio = testContent.copy(tags = List(audioTag))

  val testSection = Section(
    id = "water",
    webTitle = "Water",
    webUrl = "http://foo.bar",
    apiUrl = "http://foo.bar",
    editions = Nil
  )

  // FML ٩(ఠ益ఠ)۶
  val stubResponse = ItemResponse.apply(
    status = "ok",
    userTier = "top_tier",
    total = None,
    startIndex = None,
    pageSize = None,
    currentPage = None,
    pages = None,
    orderBy = None,
    content =  None,
    tag = None,
    edition = None,
    section = None,
    results = Some(Nil),
    quiz = None,
    relatedContent = Some(Nil),
    storyPackage = Some(Nil),
    editorsPicks = Some(Nil),
    mostViewed = Some(Nil),
    leadContent = Some(Nil),
    packages = Some(Nil),
    viewpoints = Some(Nil))

  "ModelOrNotFound" should "return the model if it exists" in {
    ModelOrResult(
      item = Some(TestModel),
      response = stubResponse
    ) should be(Left(TestModel))
  }

  it should "internal redirect to an article if it has shown up at the wrong server" in {
    val notFound = Future {
      ModelOrResult(
        item = None,
        response = stubResponse.copy(content = Some(testArticle))
      ).right.get
    }

    status(notFound) should be(200)
    headers(notFound).apply("X-Accel-Redirect") should be("/type/article/the/id")
  }

  it should "internal redirect to a video if it has shown up at the wrong server" in {
    val notFound = Future {
      ModelOrResult(
        item = None,
        response = stubResponse.copy(content = Some(testVideo))
      ).right.get
    }

    status(notFound) should be(200)
    headers(notFound).apply("X-Accel-Redirect") should be("/applications/the/id")
  }

  it should "internal redirect to a gallery if it has shown up at the wrong server" in {
    val notFound = Future { ModelOrResult(
        item = None,
        response = stubResponse.copy(content = Some(testGallery))
      ).right.get
    }

    status(notFound) should be(200)
    headers(notFound).apply("X-Accel-Redirect") should be("/applications/the/id")
  }

  it should "internal redirect to a audio if it has shown up at the wrong server" in {
    val notFound = Future { ModelOrResult(
      item = None,
      response = stubResponse.copy(content = Some(testAudio))
      ).right.get
    }

    status(notFound) should be(200)
    headers(notFound).apply("X-Accel-Redirect") should be("/applications/the/id")
  }

  it should "404 if it is an unsupported content type" in {
    val notFound = Future {
      ModelOrResult(
        item = None,
        response = stubResponse.copy(content = Some(testContent))
      ).right.get
    }

    status(notFound) should be(404)
  }

  it should "internal redirect to a tag if it has shown up at the wrong server" in {
    val notFound = Future {
      ModelOrResult(
        item = None,
        response = stubResponse.copy(tag = Some(articleTag))
      ).right.get
    }

    status(notFound) should be(200)
    headers(notFound).apply("X-Accel-Redirect") should be("/facia/type/article") //Back to facia in case it is overridden
  }

  it should "internal redirect to a section if it has shown up at the wrong server" in {
    val notFound = Future {
      ModelOrResult(
        item = None,
        response = stubResponse.copy(section = Some(testSection))
      ).right.get
    }

    status(notFound) should be(200)
    headers(notFound).apply("X-Accel-Redirect") should be("/facia/water")
  }
}
