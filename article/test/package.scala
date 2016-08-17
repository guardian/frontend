package test

import controllers.HealthCheck
import org.scalatest.{BeforeAndAfterAll, Suites, Tag}

object ArticleComponents extends Tag("article components")

class ArticleTestSuite extends Suites (
  new AnalyticsFeatureTest,
  new ArticleControllerTest,
  new ArticleMetaDataTest,
  new ArticleFeatureTest,
  new ArticleAmpValidityTest,
  new CdnHealthCheckTest,
  new SectionsNavigationFeatureTest,
  new MembershipAccessTest,
  new PublicationControllerTest
) with SingleServerSuite
  with BeforeAndAfterAll
  with WithTestWsClient {

  override lazy val port: Int = new HealthCheck(wsClient).testPort
}
