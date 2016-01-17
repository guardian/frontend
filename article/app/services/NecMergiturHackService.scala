package services

import play.api.GlobalSettings
import play.api.libs.json._
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.ws.{WSRequest, WS}

import common.{AkkaAgent, ExecutionContexts, Logging}
import org.joda.time.DateTime
import scala.concurrent.duration._
import scala.concurrent.Future
import scala.util.Failure
import scala.util.Success

case class Location(longitude: Option[Float], latitude: Option[Float], postcode: Option[String], country: Option[String])
case class Event(id: String, published: DateTime, message: String, location: Option[Location])


trait NecMergiturHackService extends GlobalSettings with ExecutionContexts with Logging {


  implicit val dateWrites = Writes.jodaDateWrites("yyyy-MM-dd'T'HH:mm:ssZ")
  implicit val dateReads = Reads.jodaDateReads("yyyy-MM-dd'T'HH:mm:ssZ")
  implicit val locationReads = Json.reads[Location]
  implicit val eventReads = Json.reads[Event]

  override def onStart(app: play.api.Application) = {
    super.onStart(app)

    val url = "https://www.dropbox.com/s/xucd83dg2pnkoie/entry.json?raw=1"
    val initialDelay = 20.seconds
    val frequency = 5.seconds

    log.info(s"alert for nec mergitur hack event will be updated every $frequency from $url")
    app.actorSystem.scheduler.schedule(initialDelay, frequency) {
      fetchEvents(app, url)
    }

  }

  private def fetchEvents(app: play.api.Application, endpoint: String): Unit = {
    val response = retrieve(app, endpoint)
    val events = response.map { optionalJson =>
      optionalJson.map { json =>
        val result = Json.parse(json).validate[Seq[Event]]
        result match {
          case s: JsSuccess[Seq[Event]] =>
            s.get
          case e: JsError =>
            log.error("Errors: " + JsError.toJson(e).toString())
            Nil
        }
      }.getOrElse(Nil)
    }
    NecMergiturHackAgent.updateEvents(events)
  }

  private def retrieve(app: play.api.Application, endpoint: String): Future[Option[String]] = {
    implicit val application = app
    WS.url(s"$endpoint").get.map { response => 
      response.status match {
        case 200 => Some(response.body)
        case _ => None
      }
    }
  }

  

}

object NecMergiturHackAgent extends ExecutionContexts with Logging {

  private val alertEvents = AkkaAgent[Map[String, Event]](Map.empty)

  def getEvents(): Seq[Event] = {
    alertEvents.get.values.toList
  }

  def updateEvents(newEvents: Future[Seq[Event]]) = {
    newEvents.flatMap { events =>
      /* for simplicty of the demo, we clear all previous events before adding the new ones */
      alertEvents.alter { existingEvents => Map.empty }
      Future.sequence(events.map { event =>
        alertEvents.alter { _ + (event.id -> event) }
      })
    } .recover {
      case error: Exception =>
          log.error("nec mergitur service hack failed somewhere " + error.getMessage(), error)
         /* this a hack we ignore any failure */
    }
  }

}


