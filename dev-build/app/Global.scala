import common.ExecutionContexts
import conf.RequestMeasurementMetrics
import controllers.front.FrontLifecycle
import dev.DevParametersLifecycle
import model.CoreNavigationLifecycle
import play.api.mvc.{RequestHeader, EssentialAction, EssentialFilter, WithFilters}

// obviously this is only for devbuild and should never end up in one of our
// prod projects
object DevCacheWarningFilter extends EssentialFilter with ExecutionContexts {
  def apply(next: EssentialAction) = new EssentialAction {
    def apply(rh: RequestHeader) = {
      next(rh).map{ result =>
        val header = result.header
        val path = rh.path
        if (
          header.status == 200 &&
            !header.headers.keySet.contains("Cache-Control") &&
            !path.startsWith("/assets/") // these are only used on DEV machines
        ) {
          // nice big warning to devs if they are working on something uncached
          println("\n\n\n---------------------------- WARNING ------------------------------------")
          println(s"URL $path has 0x06 NO CACHE-CONTROL header")
          println("-------------------------------------------------------------------------------\n\n\n")
        }
        result
      }
    }
  }
}

object Global extends WithFilters(DevCacheWarningFilter :: RequestMeasurementMetrics.asFilters: _*)
  with CoreNavigationLifecycle with FrontLifecycle with CommercialLifecycle with DevParametersLifecycle
