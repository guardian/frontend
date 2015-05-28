package controllers

import model.NoCache
import play.mvc.Controller
import play.api.mvc.Results.Redirect
import auth.PanDomainAuthActions

object VanityRedirects extends Controller with PanDomainAuthActions {

  def breakingnews = AuthAction { request =>
    NoCache(Redirect("/editorial?layout=latest,front:breaking-news", 301))}
}
