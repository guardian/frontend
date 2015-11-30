package test

import java.io.File

import controllers.{front, FaciaController}
import controllers.front.FrontJsonFapi
import org.fluentlenium.core.domain.FluentWebElement
import org.scalatest.Suites
import recorder.HttpRecorder

import scala.concurrent.Future

object `package` {

  implicit class WebElement2rich(element: FluentWebElement) {
    lazy val href = element.getAttribute("href")
    def hasAttribute(name: String) = element.getAttribute(name) != null
  }

  // need a facia controller that stores S3 locally so it can run without deps in the unit tests
  val faciaController = new FaciaController {

    override val frontJsonFapi: FrontJsonFapi = new front.FrontJsonFapi {
      override val bucketLocation: String = front.FrontJsonFapiLive.bucketLocation

      override def getRaw(path: String): Future[Option[String]] = {
        recorder.load(path, Map()) {
          super.getRaw(path)
        }
      }

      val recorder = new HttpRecorder[Option[String]] {
        override lazy val baseDir = new File(System.getProperty("user.dir"), "data/pressedPage")

        //No transformation for now as we only store content that's there.
        override def toResponse(str: String): Option[String] = Some(str)

        override def fromResponse(response: Option[String]): String = response.get // we don't need to test None yet
      }
    }
  }
}

class FaciaTestSuite extends Suites (
  new model.FaciaPageTest,
  new controllers.front.FaciaDefaultsTest,
  new services.FaciaHealthcheckTest,
  new slices.DynamicFastTest,
  new slices.DynamicSlowTest,
  new slices.StoryTest,
  new views.fragments.nav.NavigationTest,
  new FaciaControllerTest,
  new metadata.FaciaMetaDataTest
) with SingleServerSuite {

  override lazy val port: Int = conf.HealthCheck.testPort
}
