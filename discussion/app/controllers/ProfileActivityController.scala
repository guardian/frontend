package controllers

import play.api.mvc.Action
import model.Cached
import common.JsonComponent

trait ProfileActivityController extends DiscussionController {

  def profileDiscussions(userId: String) = Action.async { implicit request =>
    val page = request.getQueryString("page") getOrElse "1"
    val order = request.getQueryString("orderBy") getOrElse "newest"
    discussionApi.profileDiscussions(userId, page, order) map { profileDiscussions =>
      Cached(60) {
        JsonComponent("html" -> views.html.profileActivity.discussions(profileDiscussions))
      }
    }
  }
}
