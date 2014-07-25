package test

import conf.{HealthCheck, HealthcheckPage}
import org.scalatest.{FlatSpec, Matchers}
import play.api.test.Helpers._

class CdnHealthCheckTest extends FlatSpec with Matchers {

  //wrapping this in an HtmlUnit as we need a server running in order for the healthcheck to complete
  "CDN health check" should "mimic the instance health check" in HtmlUnit("/_cdn_healthcheck") { browser =>

    HealthcheckPage.break()
    HealthCheck.break()

    status(controllers.ArticleHealthcheckController.healthcheck()(TestRequest("/_cdn_healthcheck"))) should be(503)

    status(conf.HealthCheck.healthcheck()(TestRequest("/_healthcheck"))) should be (200)

    status(controllers.ArticleHealthcheckController.healthcheck()(TestRequest("/_cdn_healthcheck"))) should be(200)

  }
}