package controllers

import play.api.mvc.BaseController
import common.{ExecutionContexts, Logging}
import discussion.api.DiscussionApiLike

trait DiscussionController
  extends BaseController
  with Logging
  with ExecutionContexts
  with implicits.Requests {

  val discussionApi: DiscussionApiLike
}
