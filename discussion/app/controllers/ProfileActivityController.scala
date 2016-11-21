package controllers

import common.JsonComponent
import discussion.api.DiscussionApiLike
import discussion.api.DiscussionApiException._
import discussion.model.Profile
import model.{Cached, MetaData, SectionSummary, SimplePage}
import play.api.mvc.Action

class ProfileActivityController(val discussionApi: DiscussionApiLike) extends DiscussionController {
  def profilePage(profile: Profile, pageType: String) = SimplePage(
    metadata = MetaData.make(
      id = s"discussion/profile/${profile.userId}/$pageType",
      section = Some(SectionSummary.fromId("Discussion")),
      webTitle = s"${profile.displayName}'s activity"
    )
  )

  def profileDiscussions(userId: String) = Action.async { implicit request =>
    val page = request.getQueryString("page") getOrElse "1"
    discussionApi.profileDiscussions(userId, page) map { profileDiscussions =>
      Cached(60) {
        JsonComponent(views.html.profileActivity.discussions(
          profilePage(profileDiscussions.profile, "discussions"),
          profileDiscussions
        ))
      }
    } recover toResult
  }

  def profileReplies(userId: String) = Action.async { implicit request =>
    val page = request.getQueryString("page") getOrElse "1"
    discussionApi.profileReplies(userId, page) map { replies =>
      Cached(60) {
        JsonComponent(views.html.profileActivity.comments(
          profilePage(replies.profile, "replies"),
          replies
        ))
      }
    } recover toResult
  }

  def profileSearch(userId: String, q: String) = Action.async { implicit request =>
    val page = request.getQueryString("page") getOrElse "1"
    discussionApi.profileSearch(userId, q, page) map { comments =>
      Cached(60) {
        JsonComponent(views.html.profileActivity.comments(
          profilePage(comments.profile, "search"),
          comments
        ))
      }
    } recover toResult
  }

  def profilePicks(userId: String) = Action.async { implicit request =>
    val page = request.getQueryString("page") getOrElse "1"
    discussionApi.profileComments(userId, page, picks = true) map { picks =>
      Cached(60) {
        JsonComponent(views.html.profileActivity.comments(
          profilePage(picks.profile, "picks"),
          picks
        ))
      }
    } recover toResult
  }
}
