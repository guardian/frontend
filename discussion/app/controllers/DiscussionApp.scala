package controllers

import play.api.Play._
import discussion.DiscussionApi
import play.api.{Plugin, Application}

object DiscussionApp extends DiscussionController{
  protected val discussionApi = current.plugin(classOf[DiscussionApi]) getOrElse {
    throw new RuntimeException("No Discussion Api defined!")
  }
}

class DiscussionApiPlugin(app: Application) extends DiscussionApi with Plugin
