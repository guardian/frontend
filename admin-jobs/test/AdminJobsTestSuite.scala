package test

import controllers.BreakingNews.{BreakingNewsApiTest, BreakingNewsUpdaterTest}
import org.scalatest.Suites

class AdminJobsTestSuite extends Suites (
  new BreakingNewsApiTest,
  new BreakingNewsUpdaterTest,
  new controllers.NewsAlertControllerTest
) with SingleServerSuite {
  override lazy val port: Int = 19002
}
