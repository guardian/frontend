package uiComponent.core

import akka.actor.Actor
import model.ApplicationContext
import uiComponent.UIComponent
import scala.util.Try

case class Rendering(component: UIComponent, ac: ApplicationContext)

case class RenderingException(error: String) extends RuntimeException(error)

class RenderingActor extends Actor with JavascriptRendering {

  override def javascriptFile: String = "ui.bundle.server.js"

  override def receive: Receive = {
    case Rendering(component, appContext) =>
      sender ! render(component.props)(appContext)
    case  _ =>
      sender ! Try(throw new RenderingException("RenderingActor received an unknown message"))
  }

}
