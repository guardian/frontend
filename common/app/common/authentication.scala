package controllers

import common.Logging
import play.api.mvc._


trait AuthLogging {
  self: Logging =>
  def log[U](msg: String, request: Request[AnyContent]) {
    request match {
      case auth: Security.AuthenticatedRequest[AnyContent, U] => log.info(auth.user + ": " + msg)
      case _ => throw new IllegalStateException("Expected an authenticated request")
    }
  }
}