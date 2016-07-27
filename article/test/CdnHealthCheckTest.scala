package test

import controllers.HealthCheck
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._
import org.scalatest.concurrent.ScalaFutures

@DoNotDiscover class CdnHealthCheckTest extends FlatSpec with Matchers with ConfiguredTestSuite with ScalaFutures {

  "CDN health check" should "mimic the instance health check" in {
    val controller = new HealthCheck(wsClient)
    // Cache internal healthCheck results before to test endpoints
    whenReady(controller.runChecks) { _ =>
      status(controller.healthCheck()(TestRequest("/_healthcheck"))) should be (200)
      status(controller.healthCheck()(TestRequest("/_cdn_healthcheck"))) should be(200)
    }
  }
}
