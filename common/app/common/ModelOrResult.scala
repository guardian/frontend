package common

import com.gu.openplatform.contentapi.model.ItemResponse
import play.api.mvc.{ SimpleResult, RequestHeader, Results }
import model._
import implicits.ItemResponses
import java.net.URI

// TODO 'Convention dictates that Left is used for failure and Right is used for success.'
// We got this the other way around, it not an error, but we should fix it.
// Assuming that 'I can serve this to the user' is the least error state.
object ModelOrResult extends Results with Logging {

  def apply[T](item: Option[T], response: ItemResponse)(implicit request: RequestHeader): Either[T, SimpleResult] =
    item.map(i => ItemOrRedirect(i, response))
    .orElse(InternalRedirect(response))
    .getOrElse(Right(NoCache(NotFound)))
}

// Content API owns the URL space, if they say this belongs on a different URL then we follow
private object ItemOrRedirect extends ItemResponses with Logging{

  def apply[T](item: T, response: ItemResponse)(implicit request: RequestHeader) = {
    def itemPath = response.webUrl.map(new URI(_)).map(_.getPath)
    itemPath match {
      case Some(itemPath) if needsRedirect(itemPath) => Right(Found(itemPath))
      case _ => Left(item)
    }
  }

  private def needsRedirect[T](itemPath: String)(implicit request: RequestHeader): Boolean = {
    itemPath != request.path && !request.isJson
  }
}


// http://wiki.nginx.org/X-accel
// this might have ended up at the wrong server if it has a 'funny' url
private object InternalRedirect{

  lazy val ShortUrl = """^(/p/.*)$""".r

  def apply(response: ItemResponse)(implicit request: RequestHeader) = contentTypes(response)
    .orElse(response.tag.map(t => internalRedirect("type/tag", t.id)))
    .orElse(response.section.map(s => internalRedirect("type/section", s.id)))


  def contentTypes(response: ItemResponse)(implicit request: RequestHeader): Option[Right[Nothing, SimpleResult]] = {
    response.content.map {
      case a if a.isArticle || a.isLiveBlog => internalRedirect("type/article", a.id)
      case v if v.isVideo => internalRedirect("type/video", v.id)
      case g if g.isGallery => internalRedirect("type/gallery", g.id)
      case unsupportedContent => Right(Redirect(unsupportedContent.webUrl, Map("view" -> Seq("desktop"))))
    }
  }

  private def internalRedirect(base: String, id: String)(implicit request: RequestHeader) = request.path match {
    case ShortUrl(_) => Right(Found(s"/$id"))
    case _ => Right(Ok.withHeaders("X-Accel-Redirect" -> s"/$base/$id"))
  }

}
