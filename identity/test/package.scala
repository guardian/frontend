package test

import java.io.File
import common.GuardianConfiguration
import conf.{IdConfig, IdentityConfiguration}
import controllers.EditProfileControllerTest
import controllers.ConsentsJourneyControllerTest
import filters.StrictTransportSecurityHeaderFilterTest
import org.scalatest.Suites
import org.scalatestplus.play.PortNumber
import play.api.i18n.I18nComponents
import play.api._
import play.api.http.HttpConfiguration
import play.api.test.Helpers._

/**
  * Executes a block of code in a FakeApplication.
  */
trait FakeApp {
  def app: Application = {
    val environment = Environment(new File("."), this.getClass.getClassLoader, Mode.Test)
    val context = ApplicationLoader.Context.create(
      environment = environment,
      initialSettings = Map(
        "application.secret" -> "this_is_not_a_real_secret_just_for_tests",
      ),
    )
    ApplicationLoader.apply(context).load(context)
  }

  def apply[T](block: => T): T = running(app) { block }
}

object Fake extends FakeApp

class IdentityTestSuite
    extends Suites(
      new EditProfileControllerTest,
      new StrictTransportSecurityHeaderFilterTest,
      new ConsentsJourneyControllerTest,
    )
    with SingleServerSuite {}

trait WithTestIdConfig {
  class IdentityConfigurationStub extends IdConfig {
    val apiClientToken = "frontend-dev-client-token"
    val apiRoot: String = "https://id.no-id-api-exists-for-team-city.needs-to-be-faked"
    val accountDeletionApiRoot: String = "root"
    val accountDeletionApiKey: String = "key"
    val url: String = ""
    val oauthUrl: String = ""
    val domain: String = "test.domain.com"
  }

  val testIdConfig = new IdentityConfigurationStub

}
