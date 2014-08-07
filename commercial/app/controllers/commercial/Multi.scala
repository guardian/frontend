package controllers.commercial

import common.ExecutionContexts
import model.commercial.books.{BestsellersAgent, Book}
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._
import play.twirl.api.Html

import scala.concurrent.Future
import model.commercial.soulmates.{SoulmatesAggregatingAgent, Member}
import model.commercial.Ad
import model.commercial.travel.TravelOffersAgent
import model.commercial.jobs.JobsAgent
import model.commercial.masterclasses.MasterClassAgent

object Multi extends Controller with ExecutionContexts with implicits.Collections {

  def renderMulti() = MemcachedAction { implicit request =>

    Future.successful {
      val ads: Seq[Option[Ad]] = request.queryString("c").map { c =>
        c match {
          case "jobs"          => JobsAgent.adsTargetedAt(segment).headOption
          case "books"         => BestsellersAgent.adsTargetedAt(segment).headOption
          case "travel"        => TravelOffersAgent.adsTargetedAt(segment).headOption
          case "masterclasses" => MasterClassAgent.adsTargetedAt(segment).headOption
        }
      }

      println(ads)

      ads.flatten match {
        case Nil => NoCache(jsonFormat.nilResult)
        case ads => Cached(componentMaxAge) {
          htmlFormat.result(views.html.multi(ads))
        }
      }
    }

  }

}
