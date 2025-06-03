package common

import com.gu.contentapi.client.model.v1
import com.gu.contentapi.client.model.v1.{ItemResponse, Section => ApiSection}
import contentapi.Paths
import play.api.mvc.{RequestHeader, Result, Results}
import model._
import implicits.ItemResponses
import java.net.URI

object ModelOrResult extends Results with GuLogging {

  def apply[T](item: Option[T], response: ItemResponse, maybeSection: Option[ApiSection] = None)(implicit
      request: RequestHeader,
  ): Either[Result, T] =
    item
      .map(i => ItemOrRedirect(i, response, maybeSection))
      .orElse(InternalRedirect(response).map(Left(_)))
      .getOrElse(Left(NoCache(NotFound)))
}

// Content API owns the URL space, if they say this belongs on a different URL then we follow
private object ItemOrRedirect extends ItemResponses with GuLogging {

  def apply[T](item: T, response: ItemResponse, maybeSection: Option[ApiSection])(implicit
      request: RequestHeader,
  ): Either[Result, T] =
    maybeSection match {
      case Some(section) => redirectSection(item, request, section)
      case None          => redirectArticle(item, response, request)
    }

  private def redirectArticle[T](item: T, response: ItemResponse, request: RequestHeader): Either[Result, T] = {
    canonicalPath(response) match {
      case Some(canonicalPath) if canonicalPath != request.pathWithoutModifiers && !request.isModified =>
        Left(Found(canonicalPath + paramString(request)))
      case _ => Right(item)
    }

  }

  private def redirectSection[T](item: T, request: RequestHeader, section: ApiSection): Either[Result, T] = {

    if (
      request.path.endsWith("/all") &&
      pathWithoutEdition(section) != request.path.stripSuffix("/all")
    )
      Left(Found(pathWithoutEdition(section) + "/all"))
    else if (
      request.getQueryString("page").exists(_ != "1") &&
      pathWithoutEdition(section) != request.path
    )
      Left(Found(s"${pathWithoutEdition(section)}?${request.rawQueryString}"))
    else Right(item)

  }

  private def paramString(r: RequestHeader) = if (r.rawQueryString.isEmpty) "" else s"?${r.rawQueryString}"

  private def canonicalPath(response: ItemResponse) = response.webUrl.map(new URI(_)).map(_.getPath)
  def canonicalPath(content: v1.Content): String = new URI(content.webUrl).getPath

  private def pathWithoutEdition(section: ApiSection) =
    section.editions
      .find(_.code == "default")
      .map(edition => s"/${edition.id}")
      .getOrElse(Paths.stripEditionIfPresent(section.id))

}

// http://wiki.nginx.org/X-accel
// this might have ended up at the wrong server if it has a 'funny' url
object InternalRedirect extends implicits.Requests with GuLogging {

  lazy val ShortUrl = """^(/p/.*)$""".r

  def apply(response: ItemResponse)(implicit request: RequestHeader): Option[Result] =
    contentTypes(response)
      .orElse(response.tag.map(t => internalRedirect("facia", t.id)))
      .orElse(response.section.map(s => internalRedirect("facia", s.id)))

  def contentTypes(response: ItemResponse)(implicit request: RequestHeader): Option[Result] = {
    response.content.map {
      case a if a.isArticle || a.isLiveBlog =>
        internalRedirect("type/article", ItemOrRedirect.canonicalPath(a))
      case a if a.isVideo || a.isGallery || a.isAudio || a.isInteractive =>
        internalRedirect("applications", ItemOrRedirect.canonicalPath(a))
      case unsupportedContent =>
        logInfoWithRequestId(s"unsupported content: ${unsupportedContent.id}")
        NotFound
    }
  }

  def internalRedirect(base: String, id: String)(implicit request: RequestHeader): Result =
    internalRedirect(base, id, None)

  def internalRedirect(base: String, id: String, queryString: Option[String])(implicit
      request: RequestHeader,
  ): Result = {
    // remove any leading `/` from the ID before using in the redirect
    val path = id.stripPrefix("/")
    val qs: String = queryString.getOrElse("")
    request.path match {
      case ShortUrl(_) => Found(s"/$path$qs")
      case _           => Ok.withHeaders("X-Accel-Redirect" -> s"/$base/$path$qs")
    }
  }

}
