package test

import controllers.InteractiveController
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers, PrivateMethodTester}
import conf.Configuration.interactive.cdnPath

@DoNotDiscover class InteractiveControllerTest
    extends FlatSpec
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
  )
  val getWebWorkerPath = PrivateMethod[String]('getWebWorkerPath)

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

}
