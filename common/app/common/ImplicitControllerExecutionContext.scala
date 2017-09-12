package common

import play.api.mvc.BaseController

import scala.concurrent.ExecutionContext

trait ImplicitControllerExecutionContext {
  self: BaseController =>
  implicit val executionContext: ExecutionContext = controllerComponents.executionContext
}
