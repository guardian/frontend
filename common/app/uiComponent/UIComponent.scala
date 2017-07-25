package uiComponent

import model.ApplicationContext
import play.api.libs.json.JsValue
import play.api.mvc.Result
import play.api.mvc.Results._
import uiComponent.core.JavascriptRenderer

import scala.util.{Failure, Success}

trait StateSerialization[T] {
  def asJson(t: T): JsValue
}

abstract class UIComponent(javascriptFile: String) {

  lazy val renderer = new JavascriptRenderer(javascriptFile)

  def render[S](state: Option[S] = None)(implicit sr: StateSerialization[S], ac: ApplicationContext): Result =
    renderer.render(state.map(sr.asJson)) match {
      case Success(s) => Ok(s).withHeaders("Content-Type" -> "text/html")
      case Failure(f) => InternalServerError(f.getLocalizedMessage)
    }
}

