package controllers.commercial

import common.ExecutionContexts
import model.commercial.books.BestsellersAgent
import model.commercial.events.MasterclassAgent
import model.commercial.jobs.JobsAgent
import model.commercial.soulmates.SoulmatesAgent
import model.commercial.travel.TravelOffersAgent
import model.{Cached, NoCache}
import play.api.mvc._

import scala.concurrent.Future
import scala.util.Random

class Multi
  extends Controller
  with ExecutionContexts
  with implicits.Collections
  with implicits.Requests {

  def renderMulti() = Action.async { implicit request =>
    val requestedContent = request.getParameters("components")

    val slotIds = request.getParameters("slotIds")

    val componentsAndSpecificIds = requestedContent zip slotIds

    val clickMacro = request.getParameter("clickMacro")

    val omnitureId = request.getParameter("omnitureId")

    val eventualContent = componentsAndSpecificIds map {
      case ("jobs", jobId) if jobId.nonEmpty =>
        Future.successful {
          JobsAgent.specificJobs(Seq(jobId)).headOption orElse {
            JobsAgent.jobsTargetedAt(segment).headOption
          } map {
            views.html.jobs.jobsBlended(_, clickMacro)
          }
        }
      case ("jobs", _) =>
        Future.successful {
          JobsAgent.jobsTargetedAt(segment).headOption map {
            views.html.jobs.jobsBlended(_, clickMacro)
          }
        }
      case ("books", isbn) if isbn.nonEmpty =>
        BestsellersAgent.getSpecificBooks(Seq(isbn)) map { books =>
          books.headOption orElse {
            BestsellersAgent.bestsellersTargetedAt(segment).headOption
          } map {
            views.html.books.booksBlended(_, clickMacro)
          }
        }
      case ("books", _) =>
        Future.successful {
          BestsellersAgent.bestsellersTargetedAt(segment).headOption map {
            views.html.books.booksBlended(_, clickMacro)
          }
        }
      case ("travel", travelId) if travelId.nonEmpty =>
        Future.successful {
          TravelOffersAgent.specificTravelOffers(Seq(travelId)).headOption orElse {
            TravelOffersAgent.offersTargetedAt(segment).headOption
          } map {
            views.html.travel.travelBlended(_, clickMacro)
          }
        }
      case ("travel", _) =>
        Future.successful {
          TravelOffersAgent.offersTargetedAt(segment).headOption map {
            views.html.travel.travelBlended(_, clickMacro)
          }
        }
      case ("masterclasses", eventBriteId) if eventBriteId.nonEmpty =>
        Future.successful {
          MasterclassAgent.specificMasterclasses(Seq(eventBriteId)).filterNot(_.mainPicture.isEmpty).headOption orElse {
            MasterclassAgent.masterclassesTargetedAt(segment).filterNot(_.mainPicture.isEmpty).headOption
          } map {
            views.html.masterclasses.masterclassesBlended(_, clickMacro)
          }
        }
      case ("masterclasses", _) =>
        Future.successful {
          MasterclassAgent.masterclassesTargetedAt(segment).filterNot(_.mainPicture.isEmpty).headOption map {
            views.html.masterclasses.masterclassesBlended(_, clickMacro)
          }
        }
      case ("soulmates", _) =>
        Future.successful {
          for {
            woman <- SoulmatesAgent.womenAgent.sample().headOption
            man <- SoulmatesAgent.menAgent.sample().headOption
          } yield {
            views.html.soulmates.soulmatesBlended(Random.shuffle(Seq(woman, man)), clickMacro)
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
        NoCache(jsonFormat.nilResult.result)
      }
    }
  }
}

object Multi extends Multi
