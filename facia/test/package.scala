package test

import org.fluentlenium.core.domain.FluentWebElement
import play.api.GlobalSettings
import controllers.front.{Front, FrontLifecycle}
import dev.DevParametersLifecycle
import common.{AkkaAsync, FrontMetrics, Jobs}
import concurrent.duration._

object FaciaTestGlobal extends GlobalSettings with FrontLifecycle with DevParametersLifecycle {

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    Jobs.deschedule("FrontRefreshJob")
    Jobs.schedule("FrontRefreshJob", "0 * * * * ?", FrontMetrics.FrontLoadTimingMetric) {
      // stagger refresh jobs to avoid dogpiling the api
      Front.refreshJobs().zipWithIndex.foreach{ case (job, index) =>
        val sec = (index * 2) % 60
        AkkaAsync.after(sec.seconds){
          job()
        }
      }
    }

    Front.refresh()

    val start = System.currentTimeMillis

    //Our tests use things from uk, us and au. Lets wait for these three fronts (60 seconds)
    while (!Front.hasItems("uk") || !Front.hasItems("us") || !Front.hasItems("au")) {
      // ensure we don't get in an endless loop if test data changes
      if (System.currentTimeMillis - start > 60000) throw new RuntimeException("front should have loaded by now")
    }
  }

  override def onStop(app: play.api.Application) {
    // do not stop the agents
    Jobs.deschedule("FrontRefreshJob")
    super.onStop(app)
  }
}

object `package` {

  object Fake extends FakeApp {
    override val globalSettingsOverride = Some(FaciaTestGlobal)
  }

  object HtmlUnit extends EditionalisedHtmlUnit {
    override val globalSettingsOverride = Some(FaciaTestGlobal)
  }

  implicit class WebElement2rich(element: FluentWebElement) {
    lazy val href = element.getAttribute("href")
    def hasAttribute(name: String) = element.getAttribute(name) != null
  }
}