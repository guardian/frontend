package metadata

import com.gu.facia.client.models.{FrontJson, ConfigJson}
import org.jsoup.Jsoup
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.libs.json._
import play.api.test.Helpers._

import services.ConfigAgent
import test.{TestRequest, ConfiguredTestSuite}

@DoNotDiscover class FaciaMetaDataTest extends FlatSpec with Matchers with ConfiguredTestSuite with BeforeAndAfterAll {

  override def beforeAll() {
    ConfigAgent.refreshWith(
      ConfigJson(
        fronts = Map("music" -> FrontJson(Nil, None, None, None, None, None, None, None, None, None, None, None, None, None)),
        collections = Map.empty)
    )
  }

  val articleUrl = "music"

  it should "Include organisation metadata" in {
    val result = test.faciaController.renderFront(articleUrl)(TestRequest())
    MetaDataMatcher.ensureOrganisation(result)
  }

  it should "Include webpage metadata" in {
    val result = test.faciaController.renderFront(articleUrl)(TestRequest(articleUrl))
    MetaDataMatcher.ensureWebPage(result, articleUrl)
  }

  it should "Include item list metadata" in {
    val result = test.faciaController.renderFront(articleUrl)(TestRequest(articleUrl))
    val body = Jsoup.parseBodyFragment(contentAsString(result))
    status(result) should be(200)

    val script = body.getElementsByAttributeValue("data-schema", "ItemList")
    script.size() should be(1)

    val itemList: JsValue = Json.parse(script.first().html())

    val containers = (itemList \ "itemListElement").as[JsArray].value
    containers.size should be(8)

    val topContainer = (containers(0) \ "item" \ "itemListElement").as[JsArray].value
    topContainer.size should be (10)

    (topContainer(0) \ "url").as[JsString].value should be ("/music/2016/jan/06/oslo-jazz-band-review-ronnie-scotts-london-oslo-jazz-festival")

  }

}
