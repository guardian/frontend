package common

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import com.gu.openplatform.contentapi.model.{ Section, ItemResponse, Tag, Content }
import org.joda.time.DateTime
import play.api.test.Helpers._
import play.api.mvc.RequestHeader
import test.TestRequest
import scala.concurrent.Future

private object TestModel

class ModelOrResultTest extends FlatSpec with Matchers with ExecutionContexts {

  implicit val request: RequestHeader = TestRequest("/foo")

  val testContent = Content("the/id", None, None, new DateTime(), "the title", "http://www.guardian.co.uk/canonical",
    "http://foo.bar", elements = None)

  val articleTag = new Tag("type/article", "type", webTitle = "the title", webUrl = "http://foo.bar", apiUrl = "http://foo.bar")
  val galleryTag = articleTag.copy(id = "type/gallery")
  val videoTag = articleTag.copy(id = "type/video")

  val testArticle = testContent.copy(tags = List(articleTag))
  val testGallery = testContent.copy(tags = List(galleryTag))
  val testVideo = testContent.copy(tags = List(videoTag))

  val testSection = new Section("water", "Water", "http://foo.bar", "http://foo.bar", Nil)

  // FML
  val stubResponse = new ItemResponse("ok", "top_tier", None, None, None, None, None, None, None, None, None, None, Nil, Nil, Nil, Nil, Nil, Nil)

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
    headers(notFound).apply("X-Accel-Redirect") should be("/type/video/the/id")
  }

  it should "internal redirect to a gallery if it has shown up at the wrong server" in {
    val notFound = Future { ModelOrResult(
        item = None,
        response = stubResponse.copy(content = Some(testGallery))
      ).right.get
    }

    status(notFound) should be(200)
    headers(notFound).apply("X-Accel-Redirect") should be("/type/gallery/the/id")
  }

  it should "Redirect to desktop if it is an unsupported content type" in {
    val redirectedToDesktop = Future {
      ModelOrResult(
        item = None,
        response = stubResponse.copy(content = Some(testContent))
      ).right.get
    }

    status(redirectedToDesktop) should be(303)
    headers(redirectedToDesktop).get("Location").get should be("http://www.guardian.co.uk/canonical?view=desktop")
  }

  it should "internal redirect to a tag if it has shown up at the wrong server" in {
    val notFound = Future {
      ModelOrResult(
        item = None,
        response = stubResponse.copy(tag = Some(articleTag))
      ).right.get
    }

    status(notFound) should be(200)
    headers(notFound).apply("X-Accel-Redirect") should be("/type/tag/type/article")
  }

  it should "internal redirect to a section if it has shown up at the wrong server" in {
    val notFound = Future {
      ModelOrResult(
        item = None,
        response = stubResponse.copy(section = Some(testSection))
      ).right.get
    }

    status(notFound) should be(200)
    headers(notFound).apply("X-Accel-Redirect") should be("/type/section/water")
  }
}
