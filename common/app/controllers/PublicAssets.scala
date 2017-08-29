package controllers

import play.api.mvc.BaseController

trait PublicAssets extends BaseController {

  def assets: Assets

  def at(file: String, relativePath: String = "") = model.NoCache {
    assets.at("/public", relativePath + file)
  }

}
