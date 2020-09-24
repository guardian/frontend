package controllers

import play.api.mvc.BaseController
import common.{ImplicitControllerExecutionContext, Logging}
import discussion.api.DiscussionApiLike

trait DiscussionController
    extends BaseController
    with Logging
    with ImplicitControllerExecutionContext
    with implicits.Requests {

  val discussionApi: DiscussionApiLike
}
