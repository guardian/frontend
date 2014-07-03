import common.{DiagnosticsLifecycle, ExecutionContexts}
import conf.Filters
import dev.DevParametersLifecycle
import dfp.DfpAgentLifecycle
import feed.{OnwardJourneyLifecycle, MostReadLifecycle}
import implicits.Requests
import model.AdminLifecycle
import ophan.SurgingContentAgentLifecycle
import play.api.mvc.{RequestHeader, EssentialAction, EssentialFilter, WithFilters}
import services.ConfigAgentLifecycle

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
          println(s"URL $path has NO CACHE-CONTROL header")
          println("-------------------------------------------------------------------------------\n\n\n")
        }
        result
      }
    }
  }
}

// obviously this is only for devbuild and should never end up in one of our
// prod projects
object DevJsonExtensionFilter extends EssentialFilter with ExecutionContexts with Requests {
  def apply(next: EssentialAction) = new EssentialAction {
    def apply(rh: RequestHeader) = {
      if (rh.isJson && !rh.path.endsWith(".json") && !rh.path.endsWith(".js")) {
        // makes it easy for devs to see what has happened
        println("\n\n\n---------------------------- WARNING ------------------------------------")
        println(s"URL ${rh.path} does not have a .json extension")
        println("-------------------------------------------------------------------------------\n\n\n")
        throw new IllegalArgumentException("JSON endpoints must end with '.json'")
      }
      next(rh)
    }
  }
}


object Global extends WithFilters(
  DevJsonExtensionFilter :: DevCacheWarningFilter :: Filters.common: _*
)
with DevParametersLifecycle
with AdminLifecycle
with DiagnosticsLifecycle
with OnwardJourneyLifecycle
with CommercialLifecycle
with MostReadLifecycle
with DfpAgentLifecycle
with ConfigAgentLifecycle
with SurgingContentAgentLifecycle
