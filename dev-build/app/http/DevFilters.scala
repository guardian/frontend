package http

import akka.stream.Materializer
import implicits.Requests
import model.ApplicationContext
import play.api.http.HttpFilters
import play.api.mvc.{EssentialAction, EssentialFilter, RequestHeader}

import scala.concurrent.ExecutionContext

// obviously this is only for devbuild and should never end up in one of our
// prod projects
class DevCacheWarningFilter(implicit executionContext: ExecutionContext) extends EssentialFilter {
  def apply(next: EssentialAction): EssentialAction =
    new EssentialAction {
      def apply(rh: RequestHeader) = {
        next(rh).map { result =>
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
class DevJsonExtensionFilter extends EssentialFilter with Requests {
  def apply(next: EssentialAction): EssentialAction =
    new EssentialAction {
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

class DevFilters(implicit
    val mat: Materializer,
    applicationContext: ApplicationContext,
    executionContext: ExecutionContext,
) extends HttpFilters {
  override def filters: Seq[EssentialFilter] =
    new DevJsonExtensionFilter :: new DevCacheWarningFilter :: Filters.common(frontend.devbuild.BuildInfo)
}
