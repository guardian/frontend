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

      val maybeResult = for {
        job <- JobsAgent.jobsTargetedAt(segment).headOption
        book <- BestsellersAgent.bestsellersTargetedAt(segment).headOption
        travelOffer <- TravelOffersAgent.offersTargetedAt(segment).headOption
        masterclass <- MasterClassAgent.masterclassesTargetedAt(segment).headOption
        woman <- SoulmatesWomenAgent.sample(1).headOption
        man <- SoulmatesMenAgent.sample(1).headOption
      } yield {
        Cached(componentMaxAge) {
          jsonFormat.result(views.html.multi(Seq(
            views.html.jobFragments.job(job),
            views.html.books.book(book),
            views.html.travelOfferFragments.travelOffer(travelOffer),
            views.html.masterClasses.masterClass(masterclass),
            views.html.soulmateFragments.soulmates(Random.shuffle(Seq(woman, man)))
          )))
        }
      }

      maybeResult getOrElse NoCache(jsonFormat.nilResult)
    }
  }

}
