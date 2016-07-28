import controllers.BreakingNews.{BreakingNewsUpdaterTest, BreakingNewsApiTest}
import controllers.HealthCheck
import org.scalatest.{BeforeAndAfterAll, Suites}
import test.{SingleServerSuite, WithTestWsClient}

class AdminJobsTestSuite extends Suites (
  new BreakingNewsApiTest,
  new BreakingNewsUpdaterTest,
  new controllers.NewsAlertControllerTest
) with SingleServerSuite
with BeforeAndAfterAll
with WithTestWsClient {
  override lazy val port: Int = new HealthCheck(wsClient).testPort
}
