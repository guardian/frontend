package actions

import play.api.mvc.{Result, Request, Action}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

case class NoCache[A](action: Action[A]) extends Action[A] {
  override def apply(request: Request[A]): Future[Result] = {
    action(request) map { response =>
      response.withHeaders(
        ("Cache-Control", "no-cache, no-store, must-revalidate"),
        ("Pragma", "no-cache"),
        ("Expires", "0")
      )
    }
  }

  lazy val parser = action.parser
}
