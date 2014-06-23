package controllers

import play.api.mvc.Action
import model.Cached
import common.JsonComponent

trait ProfileActivityController extends DiscussionController {

  def profileDiscussions(userId: String) = Action.async { implicit request =>
    val page = request.getQueryString("page") getOrElse "1"
    discussionApi.profileDiscussions(userId, page) map { profileDiscussions =>
      Cached(60) {
        JsonComponent("html" -> views.html.profileActivity.discussions(profileDiscussions))
      }
    }
  }

  def profileReplies(userId: String) = Action.async { implicit request =>
    val page = request.getQueryString("page") getOrElse "1"
    discussionApi.profileReplies(userId, page) map { replies =>
      Cached(60) {
        JsonComponent("html" -> views.html.profileActivity.comments(replies))
      }
    }
  }

  def profileSearch(userId: String, q: String) = Action.async { implicit request =>
    val page = request.getQueryString("page") getOrElse "1"
    discussionApi.profileSearch(userId, q, page) map { comments =>
      Cached(60) {
        JsonComponent("html" -> views.html.profileActivity.comments(comments))
      }
    }
  }

  def profilePicks(userId: String) = Action.async { implicit request =>
    val page = request.getQueryString("page") getOrElse "1"
    discussionApi.profileComments(userId, page, picks = true) map { picks =>
      Cached(60) {
        JsonComponent("html" -> views.html.profileActivity.comments(picks))
      }
    }
  }
}
