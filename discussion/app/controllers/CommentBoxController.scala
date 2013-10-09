package controllers

import play.api.mvc.{AnyContent, SimpleResult, Action}
import common.JsonComponent
import model.Cached
import discussion.model.{Profile, PrivateProfileFields}

import scala.concurrent.Future

trait CommentBoxController extends DiscussionController {

  def commentBox(): Action[AnyContent] = Action.async {
    implicit request =>
      discussionApi.myProfile(request.headers) map {
        profile =>
          val fields = profile.privateFields getOrElse {throw new RuntimeException("No profile information found")}
          val box = fields match {
            case PrivateProfileFields(false, _, _) => views.html.fragments.cannotComment()
            case PrivateProfileFields(true, isPremod, _) => views.html.fragments.commentBox(isPremod, profile.avatar)
          }
          Cached(60){
            JsonComponent("html" -> box.toString)
          }
      } recover {
        case t: Throwable => JsonComponent("error" -> t.getMessage)

      }
  }
}