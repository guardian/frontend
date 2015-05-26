package controllers

import auth.ExpiringActions
import model.NoCache
import play.mvc.Controller
import play.api.mvc.Results.Redirect

object VanityRedirects extends Controller {

  def breakingnews = ExpiringActions.ExpiringAuthAction { request =>
    NoCache(Redirect("/editorial?layout=latest,front:breaking-news", 301))}
}
