package controllers

import play.api.mvc.Action
import model.Cached
import common.JsonComponent

trait CommenterActivityController extends DiscussionController{

  def commenterActivity(userId: String) = Action.async {
    implicit request =>
      val page = request.getQueryString("page") getOrElse "1"
      val order = request.getQueryString("orderBy") getOrElse "newest"
      discussionApi.commentsForUser(userId, page, order) map {
        userComments =>
          Cached(60){
            if (request.isJson)
              JsonComponent("html" -> views.html.fragments.commenterActivity(userComments).toString)
            else
              Ok(views.html.fragments.commenterActivity(userComments))
          }
      }

  }
}
