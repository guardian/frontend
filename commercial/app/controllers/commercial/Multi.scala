package controllers.commercial

import common.ExecutionContexts
import model.commercial.books.BestsellersAgent
import model.commercial.jobs.JobsAgent
import model.commercial.masterclasses.MasterClassAgent
import model.commercial.soulmates.{SoulmatesMenAgent, SoulmatesWomenAgent}
import model.commercial.travel.TravelOffersAgent
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._

import scala.concurrent.Future
import scala.util.Random

object Multi
  extends Controller
  with ExecutionContexts
  with implicits.Collections
  with implicits.Requests {

  def renderMulti() = MemcachedAction { implicit request =>
    Future.successful {

      val requestedContent = request.getParameters("components")

      val clickMacro = request.getParameter("clickMacro")

      val omnitureId = request.getParameter("omnitureId")

      val content = requestedContent flatMap {
        case "jobs" =>
          JobsAgent.jobsTargetedAt(segment).headOption map {
            views.html.jobs.jobFragment(_, clickMacro)
          }
        case "books" =>
          BestsellersAgent.bestsellersTargetedAt(segment).headOption map {
            views.html.books.bookFragment(_, clickMacro)
          }
        case "travel" =>
          TravelOffersAgent.offersTargetedAt(segment).headOption map {
            views.html.travel.travelFragment(_, clickMacro)
          }
        case "masterclasses" =>
          MasterClassAgent.masterclassesTargetedAt(segment).headOption map {
            views.html.masterClasses.masterClassFragment(_, clickMacro)
          }
        case "soulmates" =>
          for {
            woman <- SoulmatesWomenAgent.sample(1).headOption
            man <- SoulmatesMenAgent.sample(1).headOption
          } yield {
            views.html.soulmates.soulmateFragment(Random.shuffle(Seq(woman, man)), clickMacro)
          }
        case _ => None
      }

      if (requestedContent.nonEmpty && content.size == requestedContent.size) {
        Cached(componentMaxAge) {
          jsonFormat.result(views.html.multi(content, omnitureId))
        }
      } else {
        NoCache(jsonFormat.nilResult)
      }
    }
  }

}
