package test

import org.scalatest.Suites

class AdminTestSuite extends Suites (
  new football.PlayerControllerTest,
  new football.SiteControllerTest,
  new football.TablesControllerTest,
  new indexes.TagPagesTest,
  new pagepresser.HtmlCleanerTest,
  new pagepresser.InteractiveHtmlCleanerTest,
  new controllers.admin.DeploysRadiatorControllerTest,
  new controllers.admin.DeploysNotifyControllerTest
) with SingleServerSuite {
    override lazy val port: Int = 19015
}

