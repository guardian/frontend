package controllers

import play.api.mvc.Controller
import common.{ExecutionContexts, Logging}
import discussion.DiscussionApiLike

trait DiscussionController
  extends Controller
  with Logging
  with ExecutionContexts
  with implicits.Requests {

  val discussionApi: DiscussionApiLike
}
