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
import play.twirl.api.Html

import scala.concurrent.Future

object Multi extends Controller with ExecutionContexts with implicits.Collections {

  def renderMulti() = MemcachedAction { implicit request =>

    Future.successful {
      val componentParts: Seq[Html] = request.queryString("c").flatMap {
        case "jobs" =>
          JobsAgent.jobsTargetedAt(segment).headOption map { job =>
            views.html.jobFragments.job(job)
          }
        case "books" =>
          BestsellersAgent.bestsellersTargetedAt(segment).headOption map { book =>
            views.html.books.book(book)
          }
        case "travel" =>
          TravelOffersAgent.offersTargetedAt(segment).headOption map { travelOffer =>
            views.html.travelOfferFragments.travelOffer(travelOffer)
          }
        case "masterclasses" =>
          MasterClassAgent.masterclassesTargetedAt(segment).headOption map { masterclass =>
            views.html.masterClasses.masterClass(masterclass)
          }
        case "soulmates" =>
          SoulmatesAggregatingAgent.sampleMembers(segment).headOption map { member =>
            views.html.soulmateFragments.soulmate(member)
          }
        case _ => None
      }

      componentParts match {
        case Nil => NoCache(jsonFormat.nilResult)
        case parts => Cached(componentMaxAge) {
          jsonFormat.result(views.html.multi(parts))
        }
      }
    }

  }

}
