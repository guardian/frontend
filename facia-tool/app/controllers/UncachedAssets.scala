package controllers.faciatool

import actions.NoCache
import play.api.mvc.Controller

object UncachedAssets extends Controller {
  def at(file: String, relativePath: String = "") = NoCache {
    controllers.Assets.at("/public", relativePath + file)
  }
}
