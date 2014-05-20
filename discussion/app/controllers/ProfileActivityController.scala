package controllers

import play.api.mvc.Action
import model.Cached
import common.JsonComponent

trait ProfileActivityController extends DiscussionController {

  def profileComments(userId: String) = Action.async { implicit request =>
    val page = request.getQueryString("page") getOrElse "1"
    val order = request.getQueryString("orderBy") getOrElse "newest"
    discussionApi.profileComments(userId, page, order) map { profileComments =>
      Cached(60) {
        JsonComponent("html" -> _root_.views.html.profileActivity.comments(profileComments))
      }
    }
  }

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
