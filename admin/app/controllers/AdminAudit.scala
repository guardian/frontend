package controllers

import conf.switches.Switch
import play.api.Logger
import play.api.mvc.{Request, Result, Results}

import scala.concurrent.Future

object AdminAudit extends Results {
  private def unavailableMessage[A]()(implicit request: Request[A]) = {
    Logger.warn(s"Request to removed feature ${request.path}")
    ServiceUnavailable(s"If you want to use this feature, contact the Dotcom Platform Team regarding ${request.path}")
  }

  def endpointAudit[A](switch: Switch)(result: => Result)(implicit request: Request[A]): Result = {
    if (switch.isSwitchedOn) unavailableMessage() else result
  }

  def endpointAuditF[A](switch: Switch)(result: => Future[Result])(implicit request: Request[A]): Future[Result] = {
    if (switch.isSwitchedOn) Future.successful(unavailableMessage()) else result
  }
}
