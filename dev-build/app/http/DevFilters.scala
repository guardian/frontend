package http

import javax.inject.Inject
import akka.stream.Materializer
import common.ExecutionContexts
import conf.Filters
import implicits.Requests
import play.api.http.HttpFilters
import play.api.mvc.{RequestHeader, EssentialAction, EssentialFilter}


// obviously this is only for devbuild and should never end up in one of our
// prod projects
class DevCacheWarningFilter extends EssentialFilter with ExecutionContexts {
  def apply(next: EssentialAction) = new EssentialAction {
    def apply(rh: RequestHeader) = {
      next(rh).map{ result =>
        val header = result.header
        val path = rh.path
        if (
          header.status == 200 &&
            !header.headers.keySet.contains("Cache-Control") &&
            path != "/favicon.ico" &&
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
class DevJsonExtensionFilter extends EssentialFilter with ExecutionContexts with Requests {
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

class DevFilters @Inject() (implicit val mat: Materializer) extends HttpFilters {
  override def filters: Seq[EssentialFilter] = new DevJsonExtensionFilter :: new DevCacheWarningFilter :: Filters.common
}
