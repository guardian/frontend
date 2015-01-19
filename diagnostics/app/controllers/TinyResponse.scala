package controllers

import model.NoCache
import play.api.mvc.{Result, Results}

object TinyResponse extends Results {
  def apply(): Result = NoCache(NoContent)
}
