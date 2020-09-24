package http

import akka.stream.Materializer
import common.Preload
import model.ApplicationContext
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

class H2PreloadFilter(implicit
    val mat: Materializer,
    applicationContext: ApplicationContext,
    executionContext: ExecutionContext,
) extends Filter
    with implicits.Requests
    with ResultWithPreload {

  def apply(nextFilter: RequestHeader => Future[Result])(request: RequestHeader): Future[Result] = {
    nextFilter(request).map { result =>
      val contentType = result.body.contentType.getOrElse("")
      if (contentType.contains("text/html")) {
        val preloadFiles = Preload.config(request).getOrElse(applicationContext.applicationIdentity, Seq.empty)
        result.withPreload(preloadFiles)(applicationContext, request)
      } else result
    }
  }
}
