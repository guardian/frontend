package http

import akka.stream.Materializer
import common.{ExecutionContexts, Preload}
import model.ApplicationContext
import play.api.mvc._

import scala.concurrent.Future

class H2PreloadFilter (implicit val mat: Materializer, context: ApplicationContext) extends Filter
  with ExecutionContexts
  with implicits.Requests
  with ResultWithPreload {

  def apply(nextFilter: RequestHeader => Future[Result])(request: RequestHeader): Future[Result] = {
    if (request.isHtml) {
      nextFilter(request).map { result =>
        val preloadFiles = Preload.config.getOrElse(context.applicationIdentity, Seq.empty)
        result.withPreload(preloadFiles)
      }
    } else nextFilter(request)
  }

}
