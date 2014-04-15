package controllers

import play.api.mvc.{RequestHeader, Action, Controller}
import scala.concurrent.Future
import conf.SwitchingContentApi
import common.{Logging, ExecutionContexts, Edition}
import model.{Cached, Tag, Content, Section}
import services.IndexPage
import views.support.{PreviousAndNext, TemplateDeduping}
import org.joda.time.format.DateTimeFormat
import org.joda.time.DateTime
import implicits.{ItemResponses, Dates}

object AllIndexController extends Controller with ExecutionContexts with ItemResponses with Dates with Logging {

  // no need to set the zone here, it gets it from the date.
  private val dateFormat = DateTimeFormat.forPattern("yyyy/MMM/dd")

  def newer(path: String, day: String, month: String, year: String) = Action.async{ implicit request =>
    val edition = Edition(request)
    val requestedDate: DateTime = dateFormat.parseDateTime(s"$year/$month/$day").withZone(edition.timezone)
    findNewer(path, requestedDate).map{ _.map{ date =>
      val foundDate = date.withZone(edition.timezone)
      Found(s"/$path/${urlFormat(foundDate)}/all")
    }.getOrElse(Found(s"/$path/all"))}
  }

  // redirect old dated pages e.g. /sport/cycling/2011/jan/05 to new format /sport/cycling/2011/jan/05/all
  def on(path: String) = Action {
    Cached(300)(MovedPermanently(s"/$path/all"))
  }

  def all(path: String) = Action.async { implicit request =>
    implicit val dedupe = TemplateDeduping()
    val today = DateTime.now(Edition(request).timezone)

    loadLatest(path, today).map { _.map { index =>
      val yesterday = today.minusDays(1)
      Ok(views.html.all(index, PreviousAndNext(Some(s"/$path/${urlFormat(yesterday)}/all"), None)))
    }.getOrElse(NotFound)}.map(Cached(300)(_))
  }

  def allOn(path: String, day: String, month: String, year: String) = Action.async{ implicit request =>
    implicit val dedupe = TemplateDeduping()
    val edition = Edition(request)
    val requestedDate = dateFormat.parseDateTime(s"$year/$month/$day").withZone(edition.timezone)
      .toDateMidnight.plusDays(1).toDateTime.minusSeconds(1)

    loadLatest(path, requestedDate).map { _.map { index =>

      val contentOnRequestedDate = index.trails.filter(_.webPublicationDate(edition).sameDay(requestedDate))

      val olderDate = index.trails.find(!_.webPublicationDate(edition).sameDay(requestedDate)).map(_.webPublicationDate(edition))

      if (index.trails.isEmpty) {
        redirectToFirstAllPage(path)
      } else if (contentOnRequestedDate.isEmpty) {
        redirectToOlderAllPage(olderDate, path)
      } else {
        val prevPageDate = olderDate.getOrElse(requestedDate.minusDays(1))
        val prevPage = Some(s"/$path/${urlFormat(prevPageDate)}/all")
        val today = DateTime.now(edition.timezone)
        val nextPage = if (requestedDate.sameDay(today)) None else Some(s"/$path/${urlFormat(requestedDate.plusDays(1))}/newer")
        val model = index.copy(trails = contentOnRequestedDate)

        Ok(views.html.all(model, PreviousAndNext(prevPage, nextPage)))
      }
    }.getOrElse(NotFound)}.map(Cached(300)(_))
  }
  
  private def redirectToOlderAllPage(olderDate: Option[DateTime], path: String) = olderDate.map {
    older => Found(s"/$path/${urlFormat(older)}/all")
  }.getOrElse(NotFound)

  private def redirectToFirstAllPage(path: String) = Found(s"/$path/all")

  // this is simply the latest by date. No lead content, editors picks, or anything else
  private def loadLatest(path: String, date: DateTime)(implicit request: RequestHeader): Future[Option[IndexPage]] = {
    val result = SwitchingContentApi().item(s"/$path", Edition(request)).pageSize(50).toDate(date).orderBy("newest").response.map{ item =>
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

  private def findNewer(path: String, date: DateTime)(implicit request: RequestHeader): Future[Option[DateTime]] = {
    val result = SwitchingContentApi().item(s"/$path", Edition(request)).pageSize(1).fromDate(date).orderBy("oldest").response.map{ item =>
      item.results.headOption.map(_.webPublicationDate.withZone(Edition(request).timezone))
    }
    result.recover{ case e: Exception =>
      log.error(e.getMessage, e)
      None
    }
  }
  
  private def urlFormat(date: DateTime) = date.toString(dateFormat).toLowerCase
}
