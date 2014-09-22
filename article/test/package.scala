package test

import org.scalatest.{Suites, Tag}

object ArticleComponents extends Tag("article components")

class ArticleTestSuite extends Suites (
  new AnalyticsFeatureTest,
  new ArticleControllerTest,
  new ArticleFeatureTest,
  new CdnHealthCheckTest,
  new HealthCheckTest,
  new SectionsNavigationFeatureTest ) with SingleServerSuite {

  override lazy val port: Int = conf.HealthCheck.testPort
}
