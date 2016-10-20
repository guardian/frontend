package commercial.controllers

import commercial.model.Segment
import commercial.model.merchandise.books.BestsellersAgent
import commercial.model.merchandise.events.MasterclassAgent
import commercial.model.merchandise.jobs.JobsAgent
import commercial.model.merchandise.soulmates.SoulmatesAgent
import commercial.model.merchandise.travel.TravelOffersAgent
import commercial.model.merchandise.{Book, Job, LiveEvent, Masterclass, Member, MemberPair, Merchandise, TravelOffer}
import common.{ExecutionContexts, JsonComponent}
import model.Cached
import play.api.libs.json.{JsArray, Json}
import play.api.mvc._
import play.twirl.api.Html

import scala.concurrent.Future
import scala.util.Random

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

    val samples = Future.traverse(components) {
      case ("Book", Some(bookId))=>
        bestsellersAgent.getSpecificBooks(Seq(bookId)) map {
          case Nil   => bestsellersAgent.bestsellersTargetedAt(segment)
          case books => books
        }

      case ("Book", None)        =>
        Future.successful(bestsellersAgent.bestsellersTargetedAt(segment))

      case ("Job", optId)        => Future.successful(optId.flatMap { jobId =>
        val jobs = jobsAgent.specificJobs(Seq(jobId))
        if(jobs.isEmpty) None else Some(jobs)
      }.getOrElse {
        jobsAgent.jobsTargetedAt(segment)
      })

      case ("Masterclass", optId) => Future.successful(optId.flatMap { masterclassId =>
        var masterclasses = masterclassAgent.specificMasterclasses(Seq(masterclassId)).filterNot(_.mainPicture.isEmpty)
        if(masterclasses.isEmpty) None else Some(masterclasses)
      }.getOrElse {
        masterclassAgent.masterclassesTargetedAt(segment).filterNot(_.mainPicture.isEmpty)
      })

      case ("Soulmates", _)       => Future.successful {
        (for {
          woman <- SoulmatesAgent.womenAgent.sample().headOption
          man <- SoulmatesAgent.menAgent.sample().headOption
        } yield {
          Seq(MemberPair(woman, man))
        }).getOrElse {
          Nil
        }
      }

      case ("Travel", optId)      => Future.successful(optId.flatMap { travelId =>
        var travels = travelOffersAgent.specificTravelOffers(Seq(travelId))
        if(travels.isEmpty) None else Some(travels)
      }.getOrElse {
        travelOffersAgent.offersTargetedAt(segment)
      })

      case _                          => Future.successful(Nil)
    }

    samples.map(realSamples => realSamples.flatMap(_.headOption))
  }

  def renderMulti() = Action.async { implicit request =>
    val requestedContent = request.getParameters("components").map {
        case "books"  => "Book"
        case "jobs"   => "Job"
        case "travel" => "Travel"
        case "masterclasses" => "Masterclass"
        case "soulmates" => "Soulmates"
        case _        => ""
    }

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
        case _: LiveEvent   => Html("")
        case _: Member      => Html("")
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
          JsonComponent(JsArray((offerTypes zip contents).map { case (contentType, content) => Json.obj(
              "type" -> contentType,
              "value" -> Json.toJson(content)(Merchandise.merchandiseWrites)
          )}))
        }
      } else {
        Cached(componentMaxAge)(jsonFormat.nilResult)
      }
    }
  }
}
