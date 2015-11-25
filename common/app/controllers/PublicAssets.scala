package controllers

trait PublicAssets extends play.api.mvc.Controller {
  def at(file: String, relativePath: String = "") = model.NoCache {
    controllers.Assets.at("/public", relativePath + file)
  }
}
