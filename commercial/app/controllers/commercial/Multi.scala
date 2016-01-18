package controllers.commercial

import common.ExecutionContexts
import model.commercial.books.BestsellersAgent
import model.commercial.jobs.JobsAgent
import model.commercial.masterclasses.MasterClassAgent
import model.commercial.soulmates.SoulmatesAgent
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
      val requestedContent = request.getParameters("components")

      val slotIds = request.getParameters("slotIds")

      val componentsAndSpecificIds = requestedContent zip slotIds

      val clickMacro = request.getParameter("clickMacro")

      val omnitureId = request.getParameter("omnitureId")

    val eventualContent = componentsAndSpecificIds map {
      case ("jobs", jobId) if jobId.nonEmpty =>
        Future.successful {
          JobsAgent.specificJobs(Seq(jobId)).headOption map {
            views.html.jobs.jobFragment(_, clickMacro)
          }
        }
      case ("jobs", _) =>
        Future.successful {
          JobsAgent.jobsTargetedAt(segment).headOption map {
            views.html.jobs.jobFragment(_, clickMacro)
          }
        }
      case ("books", isbn) if isbn.nonEmpty =>
        BestsellersAgent.getSpecificBooks(Seq(isbn)) map { books =>
          books.headOption map { book =>
            views.html.books.bookFragment(book, clickMacro)
          }
        }
      case ("books", _) =>
        Future.successful {
          BestsellersAgent.bestsellersTargetedAt(segment).headOption map {
            views.html.books.bookFragment(_, clickMacro)
          }
        }
      case ("travel", travelId) if travelId.nonEmpty =>
        Future.successful {
          TravelOffersAgent.specificTravelOffers(Seq(travelId)).headOption map {
            views.html.travel.travelFragment(_, clickMacro)
          }
        }
      case ("travel", _) =>
        Future.successful {
          TravelOffersAgent.offersTargetedAt(segment).headOption map {
            views.html.travel.travelFragment(_, clickMacro)
          }
        }
      case ("masterclasses", eventBriteId) if eventBriteId.nonEmpty =>
        Future.successful {
          MasterClassAgent.specificClasses(Seq(eventBriteId)).headOption map {
            views.html.masterClasses.masterClassFragment(_, clickMacro)
          }
        }
      case ("masterclasses", _) =>
        Future.successful {
          MasterClassAgent.masterclassesTargetedAt(segment).headOption map {
            views.html.masterClasses.masterClassFragment(_, clickMacro)
          }
        }
      case ("soulmates", _) =>
        Future.successful {
          for {
            woman <- SoulmatesAgent.womenAgent.sample().headOption
            man <- SoulmatesAgent.menAgent.sample().headOption
          } yield {
            views.html.soulmates.soulmateFragment(Random.shuffle(Seq(woman, man)), clickMacro)
          }
        }
      case _ => Future.successful(None)
    }

    Future.sequence(eventualContent) map { contents =>
      val content = contents.flatten
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
