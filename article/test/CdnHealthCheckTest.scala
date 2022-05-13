package test

import controllers.HealthCheck
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import play.api.test.Helpers._
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

@DoNotDiscover class CdnHealthCheckTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with ScalaFutures
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestExecutionContext
    with WithTestWsClient {

  "CDN health check" should "mimic the instance health check" in {
    val testPort: Int = port
    val controller = new HealthCheck(wsClient, play.api.test.Helpers.stubControllerComponents()) {
      override val port = testPort
    }

    // Cache internal healthCheck results before to test endpoints
    whenReady(controller.runChecks) { _ =>
      status(controller.healthCheck()(TestRequest("/_healthcheck"))) should be(200)
      status(controller.healthCheck()(TestRequest("/_cdn_healthcheck"))) should be(200)
    }
  }
}
