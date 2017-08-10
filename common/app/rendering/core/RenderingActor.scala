package rendering.core

import akka.actor.Actor
import common.StopWatch
import rendering.Renderable
import scala.util.Try

case class Rendering(renderable: Renderable, forceReload: Boolean = false)

case class RenderingException(error: String) extends RuntimeException(error)

class RenderingActor extends Actor with JavascriptRendering {

  override def javascriptFile: String = "ui/dist/ui.bundle.server.js"

  override def preStart: Unit = {
    // Warming up the script engine
    val stopWatch = new StopWatch
    (1 to 25).foreach(_ => render(None))
    log.info(s"Warming up rendering actor completed in ${stopWatch.elapsed}s")

    super.preStart()
  }

  override def receive: Receive = {
    case Rendering(renderable, forceReload) =>
      sender ! render(renderable.props, forceReload)
    case  _ =>
      sender ! Try(throw new RenderingException("RenderingActor received an unknown message"))
  }

}
