package metadata

import agents.{DeeplyReadAgent, MostViewedAgent}
import com.gu.facia.client.models.{ConfigJson, FrontJson}
import conf.Configuration
import conf.switches.Switches.DCRFronts
import controllers.FaciaControllerImpl
import model.ApplicationIdentity
import org.jsoup.Jsoup
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json._
import play.api.test.Helpers._
import services.{ConfigAgent, OphanApi, SubnavAgent}
import test._

import scala.concurrent.Await
import scala.concurrent.duration._

@DoNotDiscover class FaciaMetaDataTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithTestApplicationContext
    with WithMaterializer
    with WithTestWsClient
    with MockitoSugar
    with WithTestFrontJsonFapi
    with WithTestContentApiClient
    with WithAssets {

  override def beforeAll(): Unit = {
    // These tests are designed to work with Frontend fronts not DCR fronts
    DCRFronts.switchOff()
    val refresh = ConfigAgent.refreshWith(
      ConfigJson(
        fronts =
          Map("music" -> FrontJson(Nil, None, None, None, None, None, None, None, None, None, None, None, None, None)),
        collections = Map.empty,
      ),
    )
    Await.result(refresh, 3.seconds)
  }

  lazy val faciaController = new FaciaControllerImpl(
    frontJsonFapi = fapi,
    controllerComponents = play.api.test.Helpers.stubControllerComponents(),
    ws = wsClient,
    mostViewedAgent = new MostViewedAgent(testContentApiClient, new OphanApi(wsClient)),
    deeplyReadAgent = new DeeplyReadAgent(testContentApiClient, new OphanApi(wsClient)),
    subnavAgent = new SubnavAgent(ApplicationIdentity("mock")),
    assets = assets,
  )
  val frontPath = "music"

}
