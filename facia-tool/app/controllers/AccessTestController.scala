package controllers

import acl.Table
import play.api.mvc.{Controller, Action}
import scala.concurrent.ExecutionContext.Implicits.global

object AccessTestController extends Controller {
  def test = Action.async { request =>
    Table.hasBreakingNewsAccess("robert.berry@guardian.co.uk") map { s =>
      Ok(s.toString)
    }
  }
}
