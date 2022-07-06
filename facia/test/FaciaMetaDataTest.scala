package metadata

import akka.actor.ActorSystem
import com.gu.facia.client.models.{ConfigJson, FrontJson}
import concurrent.BlockingOperations
import conf.Configuration
import controllers.FaciaControllerImpl
import org.jsoup.Jsoup
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json._
import play.api.test.Helpers._
import services.ConfigAgent

import scala.concurrent.duration._
import scala.concurrent.Await
import test._

@DoNotDiscover class FaciaMetaDataTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithTestApplicationContext
    with WithMaterializer
    with WithTestWsClient
    with MockitoSugar {

  lazy val actorSystem = ActorSystem()
  lazy val blockingOperations = new BlockingOperations(actorSystem)
  lazy val fapi = new TestFrontJsonFapi(blockingOperations)

  override def beforeAll(): Unit = {
    val refresh = ConfigAgent.refreshWith(
      ConfigJson(
        fronts =
          Map("music" -> FrontJson(Nil, None, None, None, None, None, None, None, None, None, None, None, None, None)),
        collections = Map.empty,
      ),
    )
    Await.result(refresh, 3.seconds)
  }

  lazy val faciaController = new FaciaControllerImpl(fapi, play.api.test.Helpers.stubControllerComponents(), wsClient)
  val frontPath = "music"

  it should "Include organisation metadata" in {
    val result = faciaController.renderFront(frontPath)(TestRequest())
    MetaDataMatcher.ensureOrganisation(result)
  }

  it should "Include webpage metadata" in {
    val result = faciaController.renderFront(frontPath)(TestRequest(frontPath))
    MetaDataMatcher.ensureWebPage(result, frontPath)
  }

  it should "Include item list metadata" in {
    val result = faciaController.renderFront(frontPath)(TestRequest(frontPath))
    val body = Jsoup.parseBodyFragment(contentAsString(result))
    status(result) should be(200)

    val script = body.getElementsByAttributeValue("data-schema", "ItemList")
    script.size() should be(1)

    val itemList: JsValue = Json.parse(script.first().html())

    val containers = (itemList \ "itemListElement").as[JsArray].value
    containers.size should be(6)

    val topContainer = (containers(0) \ "item" \ "itemListElement").as[JsArray].value
    println(topContainer)
    topContainer.size should be(7)

    (topContainer(0) \ "url").as[JsString].value should be(
      s"${Configuration.site.host}/music/2021/mar/09/a-century-of-music-by-british-women-review-international-womens-day-concert",
    )

  }

}
