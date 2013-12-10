package controllers

import common._
import model._
import conf._
import play.api.mvc.{ Controller, Action }

object SectionsController extends Controller with Logging {

  val page = Page("sections", "sections", "All sections", "GFE:All sections")

  def renderSectionsJson() = renderSections()
  def renderSections() = Action { implicit request =>
    val htmlResponse = () => views.html.sections(page)
    val jsonResponse = () => views.html.fragments.sectionsBody(page)
    renderFormat(htmlResponse, jsonResponse, page, Switches.all)
  }

}