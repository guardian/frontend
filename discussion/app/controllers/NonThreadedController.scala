package controllers

import model.{Page, Cached}
import common.JsonComponent
import play.api.mvc.Action
import discussion.model.DiscussionKey

object NonThreadedController extends DiscussionController {
  def unthreadedPage(key: String, title: String) = Page(
    id = s"discussion/non-threaded/$key",
    section = "Discussion",
    webTitle = s"$title",
    analyticsName = s"GFE:Article:Profile activity page"
  )

  def commentsListJson(key: DiscussionKey) = commentsList(key)
  def commentsList(key: DiscussionKey) = Action.async { implicit request =>
    val pageNo = request.getQueryString("page") getOrElse "1"
    discussionApi.discussion(key, pageNo).map { discussionComments =>
      val page: Page = unthreadedPage(
            discussionComments.discussion.key,
            discussionComments.discussion.title)

      Cached(60) {
        if (request.isJson)
          JsonComponent("html" -> views.html.unthreaded.commentsComponent(page, discussionComments))
        else
          Ok(views.html.unthreaded.commentsPage(page, discussionComments))
      }
    }
  }
}
