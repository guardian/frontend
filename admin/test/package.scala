package test

import org.scalatest.{BeforeAndAfterAll, Suites}
import pagepresser.InteractiveHtmlCleanerTest

class AdminTestSuite extends Suites (
  new football.PlayerControllerTest,
  new football.SiteControllerTest,
  new football.TablesControllerTest,
  new indexes.TagPagesTest,
  new pagepresser.HtmlCleanerTest,
  new pagepresser.InteractiveHtmlCleanerTest,
  new controllers.admin.DeploysRadiatorControllerTest,
  new controllers.admin.DeploysNotifyControllerTest
) with SingleServerSuite
  with BeforeAndAfterAll
  with WithTestWsClient {

  override lazy val port: Int = new controllers.HealthCheck(wsClient).testPort
}

