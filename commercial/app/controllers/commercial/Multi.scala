package controllers.commercial

import common.{ExecutionContexts, JsonComponent}
import model.commercial._
import model.commercial.books.BestsellersAgent
import model.commercial.events.MasterclassAgent
import model.commercial.jobs.JobsAgent
import model.commercial.soulmates.SoulmatesAgent
import model.commercial.travel.TravelOffersAgent
import model.{Cached, NoCache}
import play.api.mvc._
import play.api.libs.json.{Json, JsArray}

import scala.concurrent.Future
import scala.util.Random
import play.twirl.api.Html

class Multi(bestsellersAgent: BestsellersAgent,
            masterclassAgent: MasterclassAgent,
            travelOffersAgent: TravelOffersAgent,
            jobsAgent: JobsAgent)
  extends Controller
  with ExecutionContexts
  with implicits.Collections
  with implicits.Requests {

  private def multiSample(offerTypes: Seq[String], offerIds: Seq[Option[String]], segment: Segment): Future[Seq[Merchandise]] = {
    val components = offerTypes zip offerIds

    val samples = components map {
      case ("Book", Some(bookId))     => bestsellersAgent.getSpecificBooks(Seq(bookId))
      case ("Book", None)             => Future.successful(bestsellersAgent.bestsellersTargetedAt(segment))
      case ("Job", Some(jobId))       => Future.successful(jobsAgent.specificJobs(Seq(jobId)))
      case ("Job", None)              => Future.successful(jobsAgent.jobsTargetedAt(segment))
      case ("Masterclass", Some(masterclassId)) => Future.successful(masterclassAgent.specificMasterclasses(Seq(masterclassId)).filterNot(_.mainPicture.isEmpty))
      case ("Masterclass", None)                => Future.successful(masterclassAgent.masterclassesTargetedAt(segment).filterNot(_.mainPicture.isEmpty))
      case ("Soulmates", _)           => Future.successful {
        (for {
          woman <- SoulmatesAgent.womenAgent.sample().headOption
          man <- SoulmatesAgent.menAgent.sample().headOption
        } yield {
          Seq(MemberPair(woman, man))
        }).getOrElse {
          Nil
        }
      }

      case ("Travel", Some(travelId)) => Future.successful(travelOffersAgent.specificTravelOffers(Seq(travelId)))
      case ("Travel", None)           => Future.successful(travelOffersAgent.offersTargetedAt(segment))
      case _                          => Future.successful(Nil)
    }

    Future.sequence(samples) map { realSamples =>
        realSamples.map(_.headOption)
    } map { realSamples =>
        realSamples.flatten
    }
  }

  def renderMulti() = Action.async { implicit request =>
    val requestedContent = request.getParameters("components").map { component => component match {
        case "books"  => "Book"
        case "jobs"   => "Job"
        case "travel" => "Travel"
        case "masterclasses" => "Masterclass"
        case "soulmates" => "Soulmates"
        case _        => ""
    }}

    val slotIds = request.getParameters("slotIds").map { slotId => if (slotId.trim.isEmpty) None else Some(slotId) }

    val clickMacro = request.getParameter("clickMacro")

    val omnitureId = request.getParameter("omnitureId")

    val eventualContents = multiSample(requestedContent, slotIds, segment)

    eventualContents map { contents =>
      val content = contents map {
        case b: Book        => views.html.books.booksBlended(b, clickMacro)
        case j: Job         => views.html.jobs.jobsBlended(j, clickMacro)
        case m: Masterclass => views.html.masterclasses.masterclassesBlended(m, clickMacro)
        case p: MemberPair  => views.html.soulmates.soulmatesBlended(Random.shuffle(Seq(p.member1, p.member2)), clickMacro)
        case t: TravelOffer => views.html.travel.travelBlended(t, clickMacro)
        case _              => Html("")
      }

      if (requestedContent.nonEmpty && content.size == requestedContent.size) {
        Cached(componentMaxAge) {
          jsonFormat.result(views.html.multi(content, omnitureId))
        }
      } else {
        Cached(componentMaxAge)(jsonFormat.nilResult)
      }
    }
  }

  def getMulti() = Action.async { implicit request =>
    val offerTypes = request.getParameters("offerTypes")

    val offerIds = request.getParameters("offerIds").map { slotId => if (slotId.trim.isEmpty) None else Some(slotId) }

    val eventualContents = multiSample(offerTypes, offerIds, segment)


    eventualContents map { contents =>
      if (offerTypes.size == contents.size) {
        Cached(componentMaxAge) {
          JsonComponent(JsArray((offerTypes zip contents).map({ case (contentType, content) => Json.obj(
              "type" -> contentType,
              "value" -> Json.toJson(content)(Merchandise.writes)
          )})))
        }
      } else {
        Cached(componentMaxAge)(jsonFormat.nilResult)
      }
    }
  }
}
