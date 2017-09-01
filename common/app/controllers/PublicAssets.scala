package controllers

import common.ImplicitControllerExecutionContext
import play.api.mvc.BaseController

trait PublicAssets extends BaseController with ImplicitControllerExecutionContext {

  def assets: Assets

  def at(file: String, relativePath: String = "") = model.NoCache {
    assets.at("/public", relativePath + file)
  }

}
