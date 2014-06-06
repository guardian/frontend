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
    discussionApi.profileReplies(userId, page) map { profileDiscussions =>
      Cached(60) {
        JsonComponent("html" -> views.html.profileActivity.replies(profileDiscussions))
      }
    }
  }
}
