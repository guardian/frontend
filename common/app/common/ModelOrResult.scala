package common

import com.gu.contentapi.client.model.{ItemResponse, Section => ApiSection}
import contentapi.Paths
import play.api.mvc.{ Result, RequestHeader, Results }
import model._
import implicits.ItemResponses
import java.net.URI

// TODO 'Convention dictates that Left is used for failure and Right is used for success.'
// We got this the other way around, it not an error, but we should fix it.
// Assuming that 'I can serve this to the user' is the least error state.
object ModelOrResult extends Results with Logging {

  def apply[T](item: Option[T], response: ItemResponse, maybeSection: Option[ApiSection] = None)
              (implicit request: RequestHeader): Either[T, Result] =
    item.map(i => ItemOrRedirect(i, response, maybeSection))
      .orElse(InternalRedirect(response).map(Right(_)))
      .getOrElse(Right(NoCache(NotFound)))
}

// Content API owns the URL space, if they say this belongs on a different URL then we follow
private object ItemOrRedirect extends ItemResponses with Logging {

  def apply[T](item: T, response: ItemResponse, maybeSection: Option[ApiSection])(implicit request: RequestHeader): Either[T, Result] = {

    maybeSection map redirectSection(item, request) getOrElse redirectArticle(item, response, request)
  }

  private def redirectArticle[T](item: T, response: ItemResponse, request: RequestHeader): Either[T, Result] = {

    canonicalPath(response) match {
      case Some(canonicalPath) if canonicalPath != request.pathWithoutModifiers && !(request.isJson || request.isRss) =>
        Right(Found(canonicalPath + paramString(request)))
      case _ => Left(item)
    }

  }

  private def redirectSection[T](item: T, request: RequestHeader)(section: ApiSection): Either[T, Result] = {

    if (request.path.endsWith("/all") &&
      pathWithoutEdition(section) != request.path.stripSuffix("/all"))
      Right(Found(pathWithoutEdition(section) + "/all"))

    else if (request.getQueryString("page").exists(_ != "1") &&
      pathWithoutEdition(section) != request.path)
      Right(Found(s"${pathWithoutEdition(section)}?${request.rawQueryString}"))

    else Left(item)

  }

  private def paramString(r: RequestHeader) = if (r.rawQueryString.isEmpty) "" else s"?${r.rawQueryString}"

  private def canonicalPath(response: ItemResponse) = response.webUrl.map(new URI(_)).map(_.getPath)

  private def pathWithoutEdition(section: ApiSection) =
    section.editions.find(_.code == "default")
      .map(edition => s"/${edition.id}")
      .getOrElse(Paths.stripEditionIfPresent(section.id))

}


// http://wiki.nginx.org/X-accel
// this might have ended up at the wrong server if it has a 'funny' url
object InternalRedirect extends implicits.Requests with Logging {

  lazy val ShortUrl = """^(/p/.*)$""".r

  def apply(response: ItemResponse)(implicit request: RequestHeader): Option[Result] = contentTypes(response)
    .orElse(response.tag.map(t => internalRedirect("facia", t.id)))
    .orElse(response.section.map(s => internalRedirect("facia", s.id)))


  def contentTypes(response: ItemResponse)(implicit request: RequestHeader): Option[Result] = {
    response.content.map {
      case a if a.isArticle || a.isLiveBlog => internalRedirect("type/article", a.id)
      case v if v.isVideo => internalRedirect("applications", v.id)
      case g if g.isGallery => internalRedirect("applications", g.id)
      case a if a.isAudio => internalRedirect("applications", a.id)
      case unsupportedContent =>
        log.info(s"unsupported content: ${unsupportedContent.id}")
        NotFound

    }
  }

  def internalRedirect(base: String, id: String)(implicit request: RequestHeader): Result = internalRedirect(base, id, None)

  def internalRedirect(base: String, id: String, queryString: Option[String])(implicit request: RequestHeader): Result = {
    val qs: String = queryString.getOrElse("")
    request.path match {
      case ShortUrl(_) => Found(s"/$id$qs")
      case _ => Ok.withHeaders("X-Accel-Redirect" -> s"/$base/$id$qs")
    }
  }

}
