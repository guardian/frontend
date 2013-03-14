package common

import play.api.mvc.{ RequestHeader, Result, Results }
import com.gu.openplatform.contentapi.model.ItemResponse
import model._

// http://wiki.nginx.org/X-accel
object ModelOrResult extends Results {
  def apply[T](item: Option[T], response: ItemResponse)(implicit request: RequestHeader): Either[T, Result] =
    item.map(Left(_)).orElse {
      response.content.map {
        case a if a.isArticle => internalRedirect("type/article", a.id)
        case v if v.isVideo => internalRedirect("type/video", v.id)
        case g if g.isGallery => internalRedirect("type/gallery", g.id)
        case unsupportedContent =>
          val host = Site(request).desktopHost
          Right(Redirect(s"http://$host/${unsupportedContent.id}", Map("mobile-redirect" -> Seq("false"))))
      }
        .orElse(response.tag.map(t => internalRedirect("type/tag", t.id)))
        .orElse(response.section.map(s => internalRedirect("type/section", s.id)))
    }.getOrElse(Right(NotFound))

  private def internalRedirect(base: String, id: String) =
    Right(Ok.withHeaders("X-Accel-Redirect" -> s"/$base/$id"))
}
