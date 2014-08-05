package test

import conf.{HealthCheck}
import org.scalatest.{FlatSpec, Matchers}
import play.api.test.Helpers._

class CdnHealthCheckTest extends FlatSpec with Matchers {

  //wrapping this in an HtmlUnit as we need a server running in order for the healthcheck to complete
  "CDN health check" should "mimic the instance health check" in HtmlUnit("/_cdn_healthcheck") { browser =>

    HealthCheck.break()

    status(controllers.CdnHealthcheckController.healthcheck()(TestRequest("/_cdn_healthcheck"))) should be(503)

    status(conf.HealthCheck.healthcheck()(TestRequest("/_healthcheck"))) should be (200)

    status(controllers.CdnHealthcheckController.healthcheck()(TestRequest("/_cdn_healthcheck"))) should be(200)

  }
}