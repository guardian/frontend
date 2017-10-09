package controllers

import model.ApplicationContext
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import rendering.TestComponent
import rendering.core.Renderer

import scala.concurrent.ExecutionContext

//import io.circe.Decoder
//import io.circe._
//import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
//import io.circe.syntax._
//
//case class Props(name: String) {}
//
//object Props {
//  implicit val decoder: Decoder[Props] = deriveDecoder
//  implicit val encoder: Encoder[Props] = deriveEncoder
//}


class DevComponentController(
  renderer: Renderer,
  val controllerComponents: ControllerComponents
)(implicit ac: ApplicationContext, ec: ExecutionContext)
  extends BaseController {

  def renderComponent(): Action[AnyContent] = Action.async { implicit request =>
    renderer.render(TestComponent).map(Ok(_).withHeaders("Content-Type" -> "text/html"))
  }

  def props(): Action[AnyContent] = Action { request =>
    Ok("Success")
  }

}
