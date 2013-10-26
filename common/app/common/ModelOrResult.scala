package common

import com.gu.openplatform.contentapi.model.ItemResponse
import play.api.mvc.{ SimpleResult, RequestHeader, Results }
import model._
import conf.Switches.FollowItemRedirectsFromApiSwitch
import implicits.ItemResponses
import java.net.URI

// http://wiki.nginx.org/X-accel
object ModelOrResult extends Results with ItemResponses with Logging {
  def apply[T](item: Option[T], response: ItemResponse)(implicit request: RequestHeader): Either[T, SimpleResult] =
    item.map(i => checkItemRedirect(i, response)(request))
      .orElse { response.content.map {
        case a if a.isArticle || a.isLiveBlog => internalRedirect("type/article", a.id)
        case v if v.isVideo => internalRedirect("type/video", v.id)
        case g if g.isGallery => internalRedirect("type/gallery", g.id)
        case unsupportedContent => Right(Redirect(unsupportedContent.webUrl, Map("view" -> Seq("desktop"))))
      }
      .orElse(response.tag.map(t => internalRedirect("type/tag", t.id)))
      .orElse(response.section.map(s => internalRedirect("type/section", s.id)))
    }.getOrElse(Right(NotFound))

  private def internalRedirect(base: String, id: String) =
    Right(Ok.withHeaders("X-Accel-Redirect" -> s"/$base/$id"))

  private def checkItemRedirect[T](item: T, response: ItemResponse)(implicit request: RequestHeader) = {
    def itemPath = response.webUrl.map(new URI(_)).map(_.getPath)

    if (FollowItemRedirectsFromApiSwitch.isSwitchedOn) itemPath match {
      case Some(itemPath) if needsRedirect(itemPath) => Right(Found(itemPath))
      case _ => Left(item)
    } else {
      itemPath match {
        case Some(itemPath) if needsRedirect(itemPath) => log.info(s"would have redirected ${request.path} -> $itemPath")
        case _ => Unit
      }
      Left(item)
    }
  }

  private def needsRedirect[T](itemPath: String)(implicit request: RequestHeader): Boolean = {
    itemPath != request.path && !request.isJson
  }
}
