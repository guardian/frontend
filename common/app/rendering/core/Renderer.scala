package rendering.core

import akka.actor.{ActorSystem, Props}
import model.ApplicationContext
import rendering.Renderable
import akka.pattern.ask
import akka.routing.RoundRobinPool
import akka.util.Timeout
import common.Logging
import play.api.Mode
import play.twirl.api.Html

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.util.{Failure, Success, Try}

class Renderer(implicit actorSystem: ActorSystem, executionContext: ExecutionContext, ac: ApplicationContext) extends Logging {

  val renderingActorCount = 3
  val actor = actorSystem.actorOf(Props[RenderingActor].withRouter(RoundRobinPool(renderingActorCount)))

  val timeoutValue: Int = if(ac.environment.mode == Mode.Dev) 10 else 1
  implicit val timeout = Timeout(timeoutValue.seconds)

  def render[R <: Renderable](renderable: R): Future[Html] = {
    (actor ? Rendering(renderable, ac))
      .mapTo[Try[String]]
      .recover { case t => Try(throw t)}
      .map {
        _ match {
          case Success(s) => Html(s)
          case Failure(f) =>
            log.error(f.getLocalizedMessage)
            throw f
        }
      }

  }

}
