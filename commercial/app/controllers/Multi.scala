package commercial.controllers

import commercial.model.Segment
import commercial.model.merchandise.books.BestsellersAgent
import commercial.model.merchandise.events.MasterclassAgent
import commercial.model.merchandise.jobs.JobsAgent
import commercial.model.merchandise.travel.TravelOffersAgent
import commercial.model.merchandise.Merchandise
import common.{JsonComponent}
import model.Cached
import play.api.libs.json.{JsArray, Json}
import play.api.mvc._

class Multi(
    bestsellersAgent: BestsellersAgent,
    masterclassAgent: MasterclassAgent,
    travelOffersAgent: TravelOffersAgent,
    jobsAgent: JobsAgent,
    val controllerComponents: ControllerComponents,
) extends BaseController
    with implicits.Collections
    with implicits.Requests {

  private def multiSample(
      offerTypes: Seq[String],
      offerIds: Seq[Option[String]],
      segment: Segment,
  ): Seq[Merchandise] = {
    val components: Seq[(String, Option[String])] = offerTypes zip offerIds

    components flatMap {

      case ("Book", Some(bookId)) =>
        bestsellersAgent.getSpecificBooks(Seq(bookId)) match {
          case Nil   => bestsellersAgent.bestsellersTargetedAt(segment)
          case books => books
        }

      case ("Book", None) =>
        bestsellersAgent.bestsellersTargetedAt(segment)

      case ("Job", Some(jobId)) =>
        jobsAgent.specificJobs(Seq(jobId))

      case ("Job", None) =>
        jobsAgent.jobsTargetedAt(segment)

      case ("Masterclass", Some(masterclassId)) =>
        masterclassAgent.specificMasterclasses(Seq(masterclassId)).filterNot(_.mainPicture.isEmpty)

      case ("Masterclass", None) =>
        masterclassAgent.masterclassesTargetedAt(segment).filterNot(_.mainPicture.isEmpty)

      case ("Travel", Some(travelId)) =>
        travelOffersAgent.specificTravelOffers(Seq(travelId))

      case ("Travel", None) =>
        travelOffersAgent.offersTargetedAt(segment)

      case _ => Nil
    }
  }

  def getMulti(): Action[AnyContent] =
    Action { implicit request =>
      val offerTypes: Seq[String] = request.getParameters("offerTypes")

      val offerIds: Seq[Option[String]] = request.getParameters("offerIds") map { slotId =>
        if (slotId.trim.isEmpty) None else Some(slotId)
      }

      val contents: Seq[Merchandise] = multiSample(offerTypes, offerIds, segment)

      if (offerTypes.size == contents.size) {
        Cached(componentMaxAge) {
          JsonComponent(JsArray((offerTypes zip contents).map {
            case (contentType, content) =>
              Json.obj(
                "type" -> contentType,
                "value" -> Json.toJson(content)(Merchandise.merchandiseWrites),
              )
          }))
        }
      } else {
        Cached(componentMaxAge)(jsonFormat.nilResult)
      }
    }
}
