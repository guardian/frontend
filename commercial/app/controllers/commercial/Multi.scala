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

      val requestedContent = request.getParameters("c")

      val content = requestedContent flatMap {
        case "jobs" =>
          JobsAgent.jobsTargetedAt(segment).headOption map {
            views.html.jobFragments.job(_)
          }
        case "books" =>
          BestsellersAgent.bestsellersTargetedAt(segment).headOption map {
            views.html.books.book(_)
          }
        case "travel" =>
          TravelOffersAgent.offersTargetedAt(segment).headOption map {
            views.html.travelOfferFragments.travelOffer(_)
          }
        case "masterclasses" =>
          MasterClassAgent.masterclassesTargetedAt(segment).headOption map {
            views.html.masterClasses.masterClass(_)
          }
        case "soulmates" =>
          for {
            woman <- SoulmatesWomenAgent.sample(1).headOption
            man <- SoulmatesMenAgent.sample(1).headOption
          } yield {
            views.html.soulmateFragments.soulmates(Random.shuffle(Seq(woman, man)))
          }
        case _ => None
      }

      if (requestedContent.nonEmpty && content.size == requestedContent.size) {
        Cached(componentMaxAge) {
          jsonFormat.result(views.html.multi(content))
        }
      } else {
        NoCache(jsonFormat.nilResult)
      }
    }
  }

}
