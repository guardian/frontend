package controllers

import model.Cached
import common.JsonComponent
import play.api.mvc.Action

trait CommentPageController extends DiscussionController {

  def commentPageJson(shortUrl: String) = commentPage(shortUrl)

  def commentPage(shortUrl: String) = Action.async {
    implicit request =>
      val page = request.getQueryString("page").getOrElse("1")
      val commentPage = discussionApi.commentsFor(shortUrl, page)

      commentPage map {
        commentPage =>
          Cached(60) {
            if (request.isJson)
              JsonComponent(
                "html" -> views.html.fragments.commentsBody(commentPage).toString,
                "hasMore" -> commentPage.hasMore,
                "currentPage" -> commentPage.currentPage,
                "commentBoxHtml" -> views.html.fragments.commentBox
              )
            else
              Ok(views.html.comments(commentPage))
          }
      }
  }

}
