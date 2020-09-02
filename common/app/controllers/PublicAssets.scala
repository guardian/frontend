package controllers

import common.ImplicitControllerExecutionContext
import model.NoCache
import play.api.mvc.{AnyContent, BaseController}

trait PublicAssets extends BaseController with ImplicitControllerExecutionContext {

  def assets: Assets

  def at(file: String, relativePath: String = ""): NoCache[AnyContent] =
    model.NoCache {
      assets.at("/public", relativePath + file)
    }

}
