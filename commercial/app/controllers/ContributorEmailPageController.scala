package controllers.commercial

import common.ExecutionContexts
import model.Cached
import model.Cached.RevalidatableResult
import play.api.mvc.{Action, Controller}
import staticpages.StaticPages

import scala.concurrent.duration._

class ContributorEmailPageController extends Controller with ExecutionContexts {
  val defaultCacheDuration: Duration = 15.minutes

  def renderContributorEmailPage = Action { implicit request =>
    Cached(defaultCacheDuration)(RevalidatableResult.Ok(views.html.contributorEmailPage(StaticPages.contributorEmailPage)))
  }

  def renderContributorEmailPageResult = Action { implicit request =>
    Cached(defaultCacheDuration)(RevalidatableResult.Ok(views.html.contributorEmailSubmitted(StaticPages.contributorEmailSubmitted)))
  }
}
