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
import scala.util.Try

class Renderer(implicit actorSystem: ActorSystem, executionContext: ExecutionContext, ac: ApplicationContext) extends Logging {

  val renderingActorCount = 3
  val actor = actorSystem.actorOf(Props(classOf[RenderingActor], ac).withRouter(RoundRobinPool(renderingActorCount)))

  val timeoutValue: Int = if(ac.environment.mode == Mode.Prod) 1 else 30
  implicit val timeout = Timeout(timeoutValue.seconds)

  def render[R <: Renderable](renderable: R): Future[Html] = {
    val htmlF = (actor ? Rendering(renderable))
      .mapTo[Try[String]]
      .flatMap(Future.fromTry)
      .map(Html(_))

    htmlF.failed.foreach { t =>
      val errorMessage = Option(t.getLocalizedMessage).map(_.replaceAll("\u001B\\[[0-9]*m", "")).getOrElse("RendererError") // stripping terminal colors
      log.error(errorMessage, t)
    }

    htmlF
  }

}
