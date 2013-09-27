package controllers

import model.Cached
import common.JsonComponent
import play.api.mvc.Action

trait CommentPageController extends DiscussionController {

  def commentPage(shortUrl: String) = Action { implicit request =>
    val page = request.getQueryString("page").getOrElse("1")

    Cached.async(discussionApi.commentsFor(shortUrl, page)) {
      commentPage =>
        if (request.isJson)
          JsonComponent(
            "html" -> views.html.fragments.commentsBody(commentPage).toString,
            "hasMore" -> commentPage.hasMore,
            "currentPage" -> commentPage.currentPage,
            "commentBoxHtml" -> views.html.fragments.commentBox(commentPage.id)
          )
        else
          Ok(views.html.comments(commentPage))
    }
  }
}
