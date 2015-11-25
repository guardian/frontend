package controllers

import common.Logging
import play.api.mvc._


trait AuthLogging {
  self: Logging =>
  def log[Any](msg: String, request: Request[AnyContent]) {
    request match {
      case auth: Security.AuthenticatedRequest[_, _] => log.info(auth.user + ": " + msg)
      case _ => throw new IllegalStateException("Expected an authenticated request")
    }
  }
}
