package controllers.commercial

import common.ExecutionContexts
import model.commercial.dfp.DfpKeywordsAgent
import play.api.mvc._

object DfpKeywordViewer extends Controller with ExecutionContexts {

  def viewKeywords() = Action {
    implicit request =>
      val keywords = DfpKeywordsAgent.agent.get()
      Ok(keywords.mkString(";"))
  }
}
