package controllers

import actions.NoCache
import play.api.mvc.Controller

object UncachedAssets extends Controller {
  def at(file: String) = NoCache {
    Assets.at("/public", file)
  }
}
