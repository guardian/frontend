package test

import java.io.File

import controllers.front.FrontJsonFapiLive
import org.fluentlenium.core.domain.FluentWebElement
import org.scalatest.Suites
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WSClient
import recorder.HttpRecorder

import scala.concurrent.{ExecutionContext, Future}
import scala.io.Codec.UTF8

object `package` {

  implicit class WebElement2rich(element: FluentWebElement) {
    lazy val href = element.attribute("href")

    def hasAttribute(name: String) = element.attribute(name) != null
  }

  // need a front api that stores S3 locally so it can run without deps in the unit tests
  class TestFrontJsonFapi(override val wsClient: WSClient) extends FrontJsonFapiLive(wsClient) {

    override def getRaw(path: String)(implicit executionContext: ExecutionContext): Future[Option[JsValue]] = {
      recorder.load(path, Map()) {
        super.getRaw(path)
      }
    }

    val recorder = new HttpRecorder[Option[JsValue]] {
      override lazy val baseDir = new File(System.getProperty("user.dir"), "data/pressedPage")

      //No transformation for now as we only store content that's there.
      override def toResponse(b: Array[Byte]): Option[JsValue] = Some(Json.parse(new String(b, UTF8.charSet)))

      override def fromResponse(maybeResponse: Option[JsValue]): Array[Byte] = {
        val response = maybeResponse getOrElse {
          throw new RuntimeException("seeing None.get locally? make sure you have S3 credentials")
        }
        Json.stringify(response).getBytes(UTF8.charSet)
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
