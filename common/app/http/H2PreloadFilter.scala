package http

import javax.inject.Inject

import akka.stream.Materializer
import common.{ExecutionContexts, Preload}
import model.ApplicationContext
import play.api.mvc._

import scala.concurrent.Future

class H2PreloadFilter @Inject() (implicit val mat: Materializer, context: ApplicationContext) extends Filter
  with ExecutionContexts
  with ResultWithPreload {

  def apply(nextFilter: RequestHeader => Future[Result])(requestHeader: RequestHeader): Future[Result] = {
    nextFilter(requestHeader).map { result =>
      val preloadFiles = Preload.config(context.applicationIdentity)
      result.withPreload(preloadFiles)
    }
  }

}
