package controllers

import model.{Cors, NoCache}
import play.api.mvc.{RequestHeader, Result, Results}

object TinyResponse extends Results {
  def apply(allowedMethods: Option[String] = None)(implicit request: RequestHeader): Result = {
    Cors(NoCache(NoContent), allowedMethods)
  }
}
