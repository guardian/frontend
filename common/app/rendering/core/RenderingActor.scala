package rendering.core

import akka.actor.Actor
import model.ApplicationContext
import rendering.Renderable
import scala.util.Try

case class Rendering(renderable: Renderable, ac: ApplicationContext)

case class RenderingException(error: String) extends RuntimeException(error)

class RenderingActor extends Actor with JavascriptRendering {

  override def javascriptFile: String = "ui/dist/ui.bundle.server.js"

  override def receive: Receive = {
    case Rendering(renderable, appContext) =>
      sender ! render(renderable.props)(appContext)
    case  _ =>
      sender ! Try(throw new RenderingException("RenderingActor received an unknown message"))
  }

}
