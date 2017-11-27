package test

import java.io.File

import controllers.front.FrontJsonFapiLive
import model.PressedPage
import org.fluentlenium.core.domain.FluentWebElement
import org.scalatest.Suites
import play.api.libs.json.Json
import recorder.HttpRecorder
import services.PressedPageService

import scala.concurrent.{ExecutionContext, Future}
import scala.io.Codec.UTF8

object `package` {

  implicit class WebElement2rich(element: FluentWebElement) {
    lazy val href = element.attribute("href")

    def hasAttribute(name: String): Boolean = element.attribute(name) != null
  }

  // need a front api that stores S3 locally so it can run without deps in the unit tests
  class TestFrontJsonFapi(override val pressedPageService: PressedPageService)
    extends FrontJsonFapiLive(pressedPageService) {

    override def get(path: String)(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] = {
      recorder.load(path, Map()) {
        super.get(path)
      }
    }

    val recorder = new HttpRecorder[Option[PressedPage]] {
      override lazy val baseDir = new File(System.getProperty("user.dir"), "data/pressedPage")

      //No transformation for now as we only store content that's there.
      override def toResponse(b: Array[Byte]): Option[PressedPage] = Json.parse(new String(b, UTF8.charSet)).asOpt[PressedPage]

      override def fromResponse(maybeResponse: Option[PressedPage]): Array[Byte] = {
        val response = maybeResponse getOrElse {
          throw new RuntimeException("seeing None.get locally? make sure you have S3 credentials")
        }
        Json.stringify(Json.toJson(response)).getBytes(UTF8.charSet)
      }
    }
  }

}

class FaciaTestSuite extends Suites (
  new model.FaciaPageTest,
  new controllers.front.FaciaDefaultsTest,
  new layout.slices.DynamicFastTest,
  new layout.slices.DynamicSlowTest,
  new layout.slices.StoryTest,
  new views.fragments.nav.NavigationTest,
  new FaciaControllerTest,
  new metadata.FaciaMetaDataTest
) with SingleServerSuite {
  override lazy val port: Int = 19009
}
