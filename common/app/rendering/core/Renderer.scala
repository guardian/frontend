package rendering.core

import akka.actor.{ActorSystem, Props}
import model.ApplicationContext
import play.api.mvc.Result
import play.api.mvc.Results._
import rendering.Renderable
import akka.pattern.ask
import akka.util.Timeout
import common.Logging
import play.api.Mode

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.util.{Failure, Success, Try}

class Renderer(implicit actorSystem: ActorSystem, executionContext: ExecutionContext, ac: ApplicationContext) extends Logging {

  val actor = actorSystem.actorOf(Props[RenderingActor]) //TODO: initialize several actors

  val timeoutValue: Int = if(ac.environment.mode == Mode.Dev) 10 else 1
  implicit val timeout = Timeout(timeoutValue.seconds)

  def render[R <: Renderable](renderable: R): Future[Result] = {
    (actor ? Rendering(renderable, ac))
      .mapTo[Try[String]]
      .recover { case t => Try(throw t)}
      .map {
        _ match {
          case Success(s) =>
            Ok(s).withHeaders("Content-Type" -> "text/html")
          case Failure(f) =>
            log.error(f.getLocalizedMessage)
            InternalServerError(f.getLocalizedMessage)
        }
      }

  }

}
