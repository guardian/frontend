import common.ExecutionContexts
import conf.RequestMeasurementMetrics
import controllers.front.FrontLifecycle
import dev.DevParametersLifecycle
import play.api.mvc._

// obviously this is only for devbuild and should never end up in one of our
// prod projects
object DevCacheWarningFilter extends EssentialFilter with ExecutionContexts {
  def apply(next: EssentialAction) = new EssentialAction {
    def apply(rh: RequestHeader) = {
      next(rh).map{ result =>
        val header = result.header
        if (header.status == 200 && !header.headers.keySet.contains("Cache-Control")) {

          // nice big warning to devs if they are working on something uncached
          println("\n\n\n---------------------------- WARNING ------------------------------------")
          println(s"URL ${rh.path} has NO CACHE-CONTROL header")
          println("-------------------------------------------------------------------------------\n\n\n")
        }
        result
      }
    }
  }
}

object Global extends WithFilters(DevCacheWarningFilter :: RequestMeasurementMetrics.asFilters: _*) with MostPopularLifecycle
  with FrontLifecycle with DevParametersLifecycle
