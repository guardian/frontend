package controllers.commercial

import common.ExecutionContexts
import performance.MemcachedAction
import play.api.mvc._
import scala.concurrent.Future

import model.commercial.books.BestsellersAgent
import model.{Cached, NoCache}
import model.commercial.Ad
import model.commercial.travel.TravelOffersAgent
import model.commercial.jobs.JobsAgent
import model.commercial.masterclasses.MasterClassAgent
import model.commercial.soulmates.SoulmatesAggregatingAgent

object Multi extends Controller with ExecutionContexts with implicits.Collections {

  def renderMulti() = MemcachedAction { implicit request =>

    Future.successful {
      val ads: Seq[Ad] = request.queryString("c").flatMap {
        case "jobs" => JobsAgent.jobsTargetedAt(segment).headOption
        case "books" => BestsellersAgent.bestsellersTargetedAt(segment).headOption
        case "travel" => TravelOffersAgent.offersTargetedAt(segment).headOption
        case "masterclasses" => MasterClassAgent.masterclassesTargetedAt(segment).headOption
        case "soulmates" => SoulmatesAggregatingAgent.sampleMembers(segment).headOption
      }

      ads match {
        case Nil => NoCache(jsonFormat.nilResult)
        case as => Cached(componentMaxAge) {
          jsonFormat.result(views.html.multi(as))
        }
      }
    }

  }

}
