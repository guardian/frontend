package controllers

import play.api.mvc._
import play.api.http.HeaderNames._
import play.api.mvc.ResponseHeader
import play.api.mvc.SimpleResult
import play.api.libs.iteratee.Enumerator

import common._
import model._
import conf._

object SigninController extends Controller {
  def renderForm = Action { implicit request =>
    val page = Page(canonicalUrl = None, "style-guide", "style-guide", "Style guide: home", "GFE:Style-guide")
    Cached(60) {
      Ok(views.html.signin(page))
    }

    // SimpleResult(
    //   header = ResponseHeader(200, Map("Cache-Control" -> "max-age=60")),
    //   body = Enumerator("Ok - %s".format(request.cookies.get("GU_U").map("GU_U=" + _.value).getOrElse("Not logged in"))))
  }
}