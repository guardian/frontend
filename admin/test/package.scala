package test

import org.scalatest.Suites

class AdminTestSuite
    extends Suites(
      new football.PlayerControllerTest,
      new football.SiteControllerTest,
      new football.TablesControllerTest,
      new indexes.TagPagesTest,
      new pagepresser.HtmlCleanerTest,
      new pagepresser.InteractiveHtmlCleanerTest,
      new controllers.admin.DeploysControllerTest,
    )
    with SingleServerSuite {}
