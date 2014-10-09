package controllers.commercial

import common.ExecutionContexts
import model.commercial.books.BestsellersAgent
import model.commercial.jobs.JobsAgent
import model.commercial.masterclasses.MasterClassAgent
import model.commercial.soulmates.SoulmatesAggregatingAgent
import model.commercial.travel.TravelOffersAgent
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._

import scala.concurrent.Future

object Multi extends Controller with ExecutionContexts with implicits.Collections {

  def renderMulti() = MemcachedAction { implicit request =>

    Future.successful {
      val merchandise = request.queryString("c").flatMap {
        case "jobs" => JobsAgent.jobsTargetedAt(segment).headOption
        case "books" => BestsellersAgent.bestsellersTargetedAt(segment).headOption
        case "travel" => TravelOffersAgent.offersTargetedAt(segment).headOption
        case "masterclasses" => MasterClassAgent.masterclassesTargetedAt(segment).headOption
        case "soulmates" => SoulmatesAggregatingAgent.sampleMembers(segment).headOption
      }

      merchandise match {
        case Nil => NoCache(jsonFormat.nilResult)
        case as => Cached(componentMaxAge) {
          jsonFormat.result(views.html.multi(as))
        }
      }
    }

  }

}
