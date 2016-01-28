import org.scalatest.Suites
import test.SingleServerSuite

class AdminJobsTestSuite extends Suites (
  new controllers.BreakingNewsApiTest,
  new controllers.BreakingNewsUpdaterTest,
  new controllers.NewsAlertControllerTest
)
with SingleServerSuite {
  override lazy val port: Int = conf.HealthCheck.testPort
}
