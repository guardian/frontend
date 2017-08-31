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

case class RenderingException(error: String) extends RuntimeException(error)

class Renderer(implicit actorSystem: ActorSystem, executionContext: ExecutionContext, ac: ApplicationContext) extends Logging {

  val renderingActorCount = 3
  val actor = actorSystem.actorOf(Props(classOf[RenderingActor], ac).withRouter(RoundRobinPool(renderingActorCount)))

  val timeoutValue: Int = if(ac.environment.mode == Mode.Prod) 1 else 30
  implicit val timeout = Timeout(timeoutValue.seconds)

  def render[R <: Renderable](renderable: R): Future[Html] = {
    (actor ? Rendering(renderable))
      .mapTo[Try[String]]
      .recover { case t => Try(throw t)}
      .map {
        _ match {
          case Success(s) => Html(s)
          case Failure(f) =>
            val errorMessage = f.getLocalizedMessage.replaceAll("\u001B\\[[0-9]*m", "") // stripping terminal colors
            log.error(errorMessage)
            throw new RenderingException(errorMessage)
        }
      }

  }

}
