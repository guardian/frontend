package controllers

import play.api.mvc.{RequestHeader, Action, Controller}
import scala.concurrent.Future
import conf.LiveContentApi
import common.{Logging, ExecutionContexts, Edition}
import model.{Cached, Tag, Content, Section}
import services.{ConfigAgent, IndexPage}
import views.support.PreviousAndNext
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTimeZone, DateTime}
import implicits.{ItemResponses, Dates}
import LiveContentApi.getResponse
import common.Edition.defaultEdition

object AllIndexController extends Controller with ExecutionContexts with ItemResponses with Dates with Logging {

  // no need to set the zone here, it gets it from the date.
  private val dateFormatUTC = DateTimeFormat.forPattern("yyyy/MMM/dd").withZone(DateTimeZone.UTC)

  private def requestedDate(dateString: String) = {
    dateFormatUTC
      .parseDateTime(dateString)
      .withTimeAtStartOfDay()
      .plusDays(1)
      .minusSeconds(1)
      .toDateTime
  }

  def altDate(path: String, day: String, month: String, year: String) = Action.async{ implicit request =>
    val reqDate = requestedDate(s"$year/$month/$day").withTimeAtStartOfDay()
    findByDate(path, reqDate).map{ _.map{ date =>
      Found(s"/$path/${urlFormat(date)}/all")
    }.getOrElse(Found(s"/$path/all"))}
  }

  // redirect old dated pages e.g. /sport/cycling/2011/jan/05 to new format /sport/cycling/2011/jan/05/all
  def on(path: String) = Action {
    Cached(300)(MovedPermanently(s"/$path/all"))
  }

  def all(path: String) = Action.async { request =>
    val edition = Edition(request)

    if (ConfigAgent.shouldServeFront(path) || defaultEdition.isEditionalised(path)) {
      IndexController.render(path)(request)
    } else {
      /** No front exists, so 'all' is the same as the tag page - redirect there */
      Future.successful(Cached(300)(MovedPermanently(s"/$path")))
    }
  }

  def allOn(path: String, day: String, month: String, year: String) = Action.async { implicit request =>
    val reqDate = requestedDate(s"$year/$month/$day")

    loadLatest(path, reqDate).map { _.map { index =>

      val contentOnRequestedDate = index.trails.filter(_.webPublicationDate.sameDay(reqDate))

      val olderDate = index.trails.find(!_.webPublicationDate.sameDay(reqDate)).map(_.webPublicationDate.toDateTime)

      if (index.trails.isEmpty) {
        redirectToFirstAllPage(path)
      } else if (contentOnRequestedDate.isEmpty) {
        redirectToOlderAllPage(olderDate, path)
      } else {
        val prevPage = {
          olderDate match {
            case Some(older) => Some(s"/$path/${urlFormat(older)}/all")
            case _ => Some(s"/$path/${urlFormat(reqDate.minusDays(1))}/altdate")
          }
        }
        val today = DateTime.now
        val nextPage = if (reqDate.sameDay(today)) None else Some(s"/$path/${urlFormat(reqDate.plusDays(1))}/altdate")
        val model = index.copy(trails = contentOnRequestedDate, tzOverride = Some(DateTimeZone.UTC))

        Ok(views.html.all(model, PreviousAndNext(prevPage, nextPage)))
      }
    }.getOrElse(NotFound)}.map(Cached(300)(_))
  }

  private def redirectToOlderAllPage(olderDate: Option[DateTime], path: String) = olderDate.map {
    older => {
      val olderStartOfDay = older.withTimeAtStartOfDay().withZone(DateTimeZone.UTC)
      Found(s"/$path/${urlFormat(olderStartOfDay)}/all")
    }
  }.getOrElse(NotFound)

  private def redirectToFirstAllPage(path: String) = Found(s"/$path/all")

  // this is simply the latest by date. No lead content, editors picks, or anything else
  private def loadLatest(path: String, date: DateTime)(implicit request: RequestHeader): Future[Option[IndexPage]] = {
    val result = getResponse(
      LiveContentApi.item(s"/$path", Edition(request)).pageSize(50).toDate(date).orderBy("newest")
    ).map{ item =>
      item.section.map( section =>
        IndexPage(Section(section), item.results.map(Content(_)), date)
      ).orElse(item.tag.map( tag =>
        IndexPage(Tag(tag), item.results.map(Content(_)), date)
      ))
    }

    result.recover{ case e: Exception =>
      log.error(e.getMessage, e)
      None
    }
  }

  private def findByDate(path: String, date: DateTime)(implicit request: RequestHeader): Future[Option[DateTime]] = {
    val result = getResponse(
      LiveContentApi.item(s"/$path", Edition(request))
        .pageSize(1)
        .fromDate(date)
        .orderBy("oldest")
    ).map{ item =>
      item.results.headOption.map(_.webPublicationDate.withZone(DateTimeZone.UTC))
    }
    result.recover{ case e: Exception =>
      log.error(e.getMessage, e)
      None
    }
  }

  private def urlFormat(date: DateTime) = date.toString(dateFormatUTC).toLowerCase
}
