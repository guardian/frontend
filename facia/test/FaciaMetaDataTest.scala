package metadata

import java.io.File

import com.gu.facia.client.models.{FrontJson, ConfigJson}
import controllers.front.FrontJsonFapi
import controllers.{front, FaciaController}
import org.jsoup.Jsoup
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.libs.json._
import play.api.test.Helpers._
import recorder.HttpRecorder
import services.ConfigAgent
import test.{TestRequest, ConfiguredTestSuite}

import scala.concurrent.Future

@DoNotDiscover class FaciaMetaDataTest extends FlatSpec with Matchers with ConfiguredTestSuite with BeforeAndAfterAll {

  // need a facia controller that stores S3 locally so it can run without deps in the unit tests
  val faciaController = new FaciaController {

    override val frontJsonFapi: FrontJsonFapi = new front.FrontJsonFapi {
      override val bucketLocation: String = front.FrontJsonFapiLive.bucketLocation

      override def getRaw(path: String): Future[Option[String]] =
        recorder.load(path, Map()) {
          super.getRaw(path)
        }

      val recorder = new HttpRecorder[Option[String]] {
        override lazy val baseDir = new File(System.getProperty("user.dir"), "data/pressedPage")

        //No transformation for now as we only store content that's there.
        override def toResponse(str: String): Option[String] = Some(str)

        override def fromResponse(response: Option[String]): String = response.get // we don't need to test None yet
      }
    }
  }

  override def beforeAll() {
    ConfigAgent.refreshWith(
      ConfigJson(
        fronts = Map("music" -> FrontJson(Nil, None, None, None, None, None, None, None, None, None, None, None, None, None)),
        collections = Map.empty)
    )
  }

  val articleUrl = "music"

  it should "Include organisation metadata" in {
    val result = faciaController.renderFront(articleUrl)(TestRequest())
    MetaDataMatcher.ensureOrganisation(result)
  }

  it should "Include webpage metadata" in {
    val result = faciaController.renderFront(articleUrl)(TestRequest(articleUrl))
    MetaDataMatcher.ensureWebPage(result, articleUrl)
  }

  it should "Include item list metadata" in {
    val result = faciaController.renderFront(articleUrl)(TestRequest(articleUrl))
    val body = Jsoup.parseBodyFragment(contentAsString(result))
    status(result) should be(200)

    val script = body.getElementsByAttributeValue("data-schema", "ItemList")
    script.size() should be(1)

    val itemList: JsValue = Json.parse(script.first().html())

    val containers = (itemList \ "itemListElement").as[JsArray].value
    containers.size should be(8)

    val topContainer = (containers(0) \ "item" \ "itemListElement").as[JsArray].value
    topContainer.size should be (10)

    (topContainer(0) \ "url").as[JsString].value should be ("/music/2015/sep/10/billie-holiday-hologram-headed-to-new-yorks-apollo-theatre")

  }

}
