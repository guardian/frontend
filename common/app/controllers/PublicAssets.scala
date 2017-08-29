package controllers

import play.api.mvc.BaseController

trait PublicAssets extends BaseController {
  def at(file: String, relativePath: String = "") = model.NoCache {
    controllers.Assets.at("/public", relativePath + file)
  }
}
