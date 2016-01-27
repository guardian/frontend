import org.scalatest.Suites
import test.SingleServerSuite

class AdminJobsTestSuite extends Suites (
  new controllers.NewsAlertControllerTest,
  new controllers.BreakingNewsApiTest)
with SingleServerSuite {
  override lazy val port: Int = conf.HealthCheck.testPort
}
