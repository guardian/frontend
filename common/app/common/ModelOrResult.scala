package common

import com.gu.openplatform.contentapi.model.ItemResponse
import play.api.mvc.{ SimpleResult, RequestHeader, Results }
import model._

// http://wiki.nginx.org/X-accel
object ModelOrResult extends Results {
  def apply[T](item: Option[T], response: ItemResponse)(implicit request: RequestHeader): Either[T, SimpleResult] =
    item.map(Left(_)).orElse {
      response.content.map {
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
}
