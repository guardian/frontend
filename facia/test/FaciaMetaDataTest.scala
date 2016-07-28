package metadata

import com.gu.facia.client.models.{ConfigJson, FrontJson}
import controllers.FaciaControllerImpl
import org.jsoup.Jsoup
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.libs.json._
import play.api.test.Helpers._
import services.ConfigAgent
import test._

@DoNotDiscover class FaciaMetaDataTest extends FlatSpec with Matchers with ConfiguredTestSuite with BeforeAndAfterAll with WithMaterializer with WithTestWsClient {

  override def beforeAll() {
    ConfigAgent.refreshWith(
      ConfigJson(
        fronts = Map("music" -> FrontJson(Nil, None, None, None, None, None, None, None, None, None, None, None, None, None)),
        collections = Map.empty)
    )
  }

  val faciaController = new FaciaControllerImpl(new TestFrontJsonFapi(wsClient))
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
    containers.size should be(14)

    val topContainer = (containers(0) \ "item" \ "itemListElement").as[JsArray].value
    topContainer.size should be (17)

    (topContainer(0) \ "url").as[JsString].value should be ("/music/musicblog/2015/may/27/stone-roses-spike-island-the-reality")

  }

}
