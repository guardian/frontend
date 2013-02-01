package common

import play.api.mvc.{ Result, Results }
import com.gu.openplatform.contentapi.model.ItemResponse
import model._

// http://wiki.nginx.org/X-accel
object ModelOrNotFound extends Results {
  def apply[T](item: Option[T], response: ItemResponse): Either[T, Result] =
    item.map(Left(_)).orElse {
      response.content.map {
        case a if a.isArticle => internalRedirect("type/article", a.id)
        case v if v.isVideo => internalRedirect("type/video", v.id)
        case g if g.isGallery => internalRedirect("type/gallery", g.id)

        // TODO we could do something clever here, it means we know this exists but that we do not yet support it,
        // maybe a page that says "want to see this on our main site?"
        case _ => Right(NotFound)
      }
        .orElse(response.tag.map(t => internalRedirect("type/tag", t.id)))
        .orElse(response.section.map(s => internalRedirect("type/section", s.id)))
    }.getOrElse(Right(NotFound))

  private def internalRedirect(base: String, id: String) =
    Right(NotFound.withHeaders("X-Accel-Redirect" -> "/%s/%s".format(base, id)))
}
