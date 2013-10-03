package controllers

import play.api.mvc.Action
import common.JsonComponent
import model.Cached
import discussion.model.{Profile, PrivateProfileFields}

import scala.concurrent.Future

trait CommentBoxController extends DiscussionController {

  def commentBox() = Action.async {
    implicit request =>
//      discussionApi.myProfile(request.headers, request.cookies) map {
      Future(FakeProfile) map {
        profile =>
          val fields = profile.privateFields getOrElse {throw new RuntimeException("No profile information found")}
          val box = fields match {
            case PrivateProfileFields(false, _, _) => views.html.fragments.cannotCommentBox
            case PrivateProfileFields(true, true, _) => views.html.fragments.commentBox
            case _ => views.html.fragments.premodCommentBox
          }
          Cached(60){
            JsonComponent("html" -> box.toString)
          }
      }
  }
}

object FakeProfile extends Profile(
  "",
  "Fake Profile",
  isStaff = false,
  isContributor = false,
  privateFields = Some(PrivateProfileFields(
    canPostComment = true,
    isPremoderated = false,
    isSocial = false
  ))
)