package controllers

import common._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import model.Page

object SectionsController extends Controller with Logging {

  val page = Page("http://www.guardian.co.uk/", "sections", "sections", "http://content.guardianapis.com/sections", "All fixtures")

  def render = Action { implicit request =>
    CachedOk(page) {
      Compressed(views.html.sections(page))
    }
  }

}