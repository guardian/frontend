package controllers

import javax.inject.Inject

import akka.stream.Materializer
import model.ApplicationContext
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

class H2PreloadFilter @Inject() (implicit val mat: Materializer, ec: ExecutionContext, context: ApplicationContext) extends Filter
  with ResultWithPreload {

  def apply(nextFilter: RequestHeader => Future[Result])
           (requestHeader: RequestHeader): Future[Result] = {

    val articleDefault = Seq("content.css", "javascripts/graun.standard.js", "javascripts/graun.commercial.js")

    nextFilter(requestHeader).map { result =>
      result.withPreload(articleDefault)
    }
  }

}
