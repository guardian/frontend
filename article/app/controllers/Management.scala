package controllers

import com.gu.management.play.ManagementController
import com.gu.management.logback.LogbackLevelPage
import com.gu.management._
import conf.{ Metrics, Switches, Configuration }

object Management extends ManagementController {

  override val applicationName = "Frontend Article"

  lazy val pages = List(
    new ManifestPage,
    new HealthcheckManagementPage,
    new Switchboard(Switches.all, applicationName),
    StatusPage("frontend-article", Metrics.all),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
