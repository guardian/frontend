package controllers

import model.Cached
import common.JsonComponent
import play.api.mvc.Action
import discussion.model.{Profile, DiscussionKey, Comment}
import org.joda.time.DateTime

trait CommentPageController extends DiscussionController {

  def commentPageJson(key: DiscussionKey) = commentPage(key)

  def commentPage(key: DiscussionKey) = Action.async {
    implicit request =>
      val page = request.getQueryString("page").getOrElse("1")
      val pageSize = request.getQueryString("pageSize").getOrElse("")
      val maxResponses = request.getQueryString("maxResponses").getOrElse("999")
      val commentPage = discussionApi.commentsFor(key, page, pageSize, maxResponses)

      commentPage map {
        commentPage =>
          Cached(60) {
            if (request.isJson)
              JsonComponent(
                "html" -> views.html.fragments.commentsBody(commentPage, blankComment).toString,
                "hasMore" -> commentPage.hasMore,
                "currentPage" -> commentPage.currentPage
              )
            else
              Ok(views.html.comments(commentPage))
          }
      }
  }

  def blankComment =  new Comment(
    id = 5, body = "", responses = List(), date = new DateTime(),
    profile = new Profile("", "", "", false, false, None), isHighlighted = false, isBlocked = false,
    responseTo = None, numRecommends = 0, responseCount = 0
  )

}
