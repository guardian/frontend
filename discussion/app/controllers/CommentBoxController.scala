package controllers

import play.api.mvc.Action
import common.JsonComponent
import model.Cached
import discussion.model.{Profile, PrivateProfileFields}

import scala.concurrent.Future

trait CommentBoxController extends DiscussionController {

  def commentBox() = Action.async {
    implicit request =>
      discussionApi.myProfile(request.headers) map {
//      Future(FakeProfile) map {
        profile =>
          val fields = profile.privateFields getOrElse {throw new RuntimeException("No profile information found")}
          val box = fields match {
            case PrivateProfileFields(false, _, _) => views.html.fragments.cannotComment()
            case PrivateProfileFields(true, isPremod, _) => views.html.fragments.commentBox(isPremod)
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
    canPostComment = false,
    isPremoderated = true,
    isSocial = false
  ))
)