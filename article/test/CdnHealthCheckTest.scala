package test

import conf.HealthCheck
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._

@DoNotDiscover class CdnHealthCheckTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  //wrapping this in an HtmlUnit as we need a server running in order for the healthcheck to complete
  "CDN health check" should "mimic the instance health check" in goTo("/_cdn_healthcheck") { browser =>

    HealthCheck.break()

    status(controllers.CdnHealthcheckController.healthcheck()(TestRequest("/_cdn_healthcheck"))) should be(503)

    status(HealthCheck.healthcheck()(TestRequest("/_healthcheck"))) should be (200)

    status(controllers.CdnHealthcheckController.healthcheck()(TestRequest("/_cdn_healthcheck"))) should be(200)

  }
}