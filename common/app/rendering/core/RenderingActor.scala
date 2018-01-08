package rendering.core

import akka.actor.Actor
import common.StopWatch
import model.ApplicationContext
import play.api.Mode
import rendering.Renderable

import scala.util.Try

case class RenderingException(error: String) extends RuntimeException(error)
case class Rendering(renderable: Renderable)

class RenderingActor(ac: ApplicationContext) extends Actor with JavascriptRendering {

  override def javascriptFile: String = "ui/dist/ui.bundle.server.js"

  val isRunningInProd = ac.environment.mode == Mode.Prod

  override def preStart: Unit = {
    // Warming up the script engine in PROD
    if(isRunningInProd) {
      val stopWatch = new StopWatch
      (1 to 100).foreach(_ => render(None))
      log.info(s"Warming up rendering actor completed in ${stopWatch.elapsed}s")
    }
    super.preStart()
  }

  override def receive: Receive = {
    case Rendering(renderable) =>
      sender ! render(renderable.props, !isRunningInProd)
    case  _ =>
      sender ! Try(throw RenderingException("RenderingActor received an unknown message"))
  }

}
