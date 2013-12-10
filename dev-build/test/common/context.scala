package common

import test.TestSettings
import play.api.GlobalSettings
import model.CoreNavigationLifecycle
import conf.FootballStatsPlugin
import play.api.test.Helpers._
import scala.Some
import play.api.test.{FakeApplication, TestServer}
import scala.sys.process.Process

object CoreNavGlobal extends GlobalSettings with CoreNavigationLifecycle

object Server extends TestSettings {
  override val globalSettingsOverride = Some(CoreNavGlobal)
  override val disabledPlugins = Seq(
    classOf[FootballStatsPlugin].getName
  ) ++ super.disabledPlugins

  def apply(block: => Unit) = {
    running(TestServer(9000,
      new FakeApplication(
        additionalPlugins = testPlugins,
        withoutPlugins = disabledPlugins,
        withGlobal = globalSettingsOverride){

        // Yeah I know... Play calls Start and Stop on ALL plugins regardless of whether you want them or not...
        override lazy val plugins = FakeApplication().plugins.filterNot(p => withoutPlugins.exists(_ == p.getClass.getName))

      }), HTMLUNIT) { browser =>
      block
    }
  }
}

object Grunt {
  def apply(test: String) = Process(s"grunt casperjs:$test").!
}