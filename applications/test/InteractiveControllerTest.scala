package test

import conf.Configuration.interactive.cdnPath
import controllers.InteractiveController
import model.InteractivePage
import model.dotcomrendering.PageType
import model.meta.BlocksOn
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, PrivateMethodTester}
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result, Results}
import play.api.test.Helpers._

import scala.concurrent.Future

class DCRFake() extends renderers.DotcomRenderingService {
  override def getInteractive(
      ws: WSClient,
      pageBlocks: BlocksOn[InteractivePage],
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {
    Future.successful(Results.Ok("test"))
  }
}

@DoNotDiscover class InteractiveControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient
    with PrivateMethodTester {

  val url = "lifeandstyle/ng-interactive/2016/mar/12/stephen-collins-cats-cartoon"
  lazy val interactiveController = new InteractiveController(
    testContentApiClient,
    wsClient,
    play.api.test.Helpers.stubControllerComponents(),
    new DCRFake(),
  )

  val getWebWorkerPath = PrivateMethod[String](Symbol("getWebWorkerPath"))

  "Interactive Controller" should "200 when content type is 'interactive'" in {
    val result = interactiveController.renderInteractive(url)(TestRequest(url))
    status(result) should be(200)
  }

  "Interactive web worker path" should "add timestamp to path if present" in {
    val path = "lifeandstyle/ng-interactive/2016"
    val timestamp = Some("1477559425")
    val file = "interactive-worker.js"
    val workerPath = interactiveController invokePrivate getWebWorkerPath(path, file, timestamp)
    workerPath should be(
      s"$cdnPath/service-workers/live/lifeandstyle/ng-interactive/2016/1477559425/interactive-worker.js",
    )
  }

  "Interactive service worker path" should "work when no timestamp is present" in {
    val path = "lifeandstyle/ng-interactive/2016"
    val timestamp = None
    val file = "interactive-service-worker.js"
    val workerPath = interactiveController invokePrivate getWebWorkerPath(path, file, timestamp)
    workerPath should be(
      s"$cdnPath/service-workers/live/lifeandstyle/ng-interactive/2016/interactive-service-worker.js",
    )
  }

  "Interactive serve pressed page" should "return expected headers and path" in {
    val result = interactiveController.servePressedPage(url)(TestRequest(url))

    header("X-Accel-Redirect", result).head should be(
      s"/s3-archive/www.theguardian.com/$url",
    )
  }
}
