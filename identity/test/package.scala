package test

import java.io.File

import play.api.i18n.I18nComponents
import play.api._
import play.api.test.Helpers._


/**
 * Executes a block of code in a FakeApplication.
 */
trait FakeApp extends TestSettings {
  def app: Application = {
    val environment = Environment(new File("."), this.getClass.getClassLoader, Mode.Test)
    val context = ApplicationLoader.createContext(
      environment = environment,
      initialSettings = Map(
        "application.secret" -> "this_is_not_a_real_secret_just_for_tests"
      )
    )
    ApplicationLoader.apply(context).load(context)
  }

  def apply[T](block: => T): T = running(app) { block }
}

object Fake extends FakeApp

object I18NTestComponents extends I18nComponents {
  override val environment: Environment = Environment(new File("."), this.getClass.getClassLoader, Mode.Test)
  override val configuration: Configuration = Configuration.load(environment)
}
