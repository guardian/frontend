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
  def signin = Action { implicit request =>
    val page = Page(canonicalUrl = None, "identity", "identity", "Identity - Sign in", "")
    Cached(60) {
      Ok(views.html.signin(page))
    }
  }
}