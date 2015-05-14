package controllers

import common.Logging
import play.api.mvc._
import play.api.Logger

trait AuthLogging {
  self: Logging =>
  def log[U](msg: String, request: Request[AnyContent]) {
    request match {
      case auth: Security.AuthenticatedRequest[AnyContent, U] => log.info(auth.user + ": " + msg)
      case x => throw new IllegalStateException("Expected an authenticated request")
    }
  }
}
