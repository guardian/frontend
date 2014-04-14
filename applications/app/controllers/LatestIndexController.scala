package controllers

import play.api.mvc.{RequestHeader, Action, Controller}
import scala.concurrent.Future
import conf.SwitchingContentApi
import model.{Cached, Tag, Content, Section}
import services.IndexPage
import common._

object LatestIndexController extends Controller with ExecutionContexts with implicits.ItemResponses with Logging {

  def latest(path: String) = Action.async { implicit request =>

    loadLatest(path).map { _.map { index =>
      index.page match {
        case tag: Tag if tag.isSeries || tag.isBlog => index.trails.headOption.map(latest => Found(latest.url)).getOrElse(NotFound)
        case tag: Tag => MovedPermanently(s"${tag.url}/all")
        case section: Section => MovedPermanently(s"${section.url}/all")
        case _ => NotFound
      }
    }.getOrElse(NotFound)}.map(Cached(300)(_))
  }

  // this is simply the latest by date. No lead content, editors picks, or anything else
  private def loadLatest(path: String)(implicit request: RequestHeader): Future[Option[IndexPage]] = {
    val result = SwitchingContentApi().item(s"/$path", Edition(request)).pageSize(1).orderBy("newest").response.map{ item =>
      item.section.map( section =>
        IndexPage(Section(section), item.results.map(Content(_)))
      ).orElse(item.tag.map( tag =>
        IndexPage(Tag(tag), item.results.map(Content(_)))
      ))
    }

    result.recover{ case e: Exception =>
      log.error(e.getMessage, e)
      None
    }
  }
}
