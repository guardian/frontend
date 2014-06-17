package controllers

import model.{Page, Cached}
import scala.concurrent.Future
import common.JsonComponent
import play.api.mvc.{ Action, RequestHeader, SimpleResult }
import discussion.model.{BlankComment, DiscussionKey}

trait NonThreadedController extends DiscussionController {
  def page(key: String, title: String, page: String) = Page(
    id = key,
    section = "Global",
    webTitle = title,
    analyticsName = s"GFE:Article:Comment discussion unthreaded page $page"
  )

  def commentsListJson(key: DiscussionKey) = commentsList(key)
  def commentsList(key: DiscussionKey) = Action.async { implicit request =>
    discussionApi.discussion(key).map { discussionComments =>
      if (request.isJson)
        Cached(60){
          JsonComponent(
            "html" -> views.html.unthreaded.commentsComponent(discussionComments)
          )
        }
      else
        Cached(60){
          Ok(views.html.unthreaded.commentsPage(page(
            discussionComments.discussion.key,
            discussionComments.discussion.title,
            discussionComments.pagination.currentPage.toString
          ), discussionComments))
        }
    }
  }
}
