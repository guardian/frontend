package test
import org.scalatest.Suites

class AdminTestSuite extends Suites (
  new football.PlayerControllerTest,
  new football.SiteControllerTest,
  new football.TablesControllerTest,
  new indexes.TagPagesTest,
  new services.AdminHealthCheckTest,
  new pagepresser.HtmlCleanerTest  ) with SingleServerSuite {

  override lazy val port: Int = controllers.HealthCheck.testPort
}