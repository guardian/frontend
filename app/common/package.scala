package common

import com.gu.openplatform.contentapi.ApiError
import com.gu.openplatform.contentapi.model.{ Content => ApiContent }
import play.api.Logger

object `package` {
  implicit def string2ToIntOption(s: String) = new {
    lazy val toIntOption: Option[Int] = try {
      Some(s.toInt)
    } catch {
      case _ => None
    }
  }

  implicit def content2understandsContentType(content: ApiContent) = new {
    lazy val isArticle: Boolean = content.tags exists { _.id == "type/article" }
  }

  def suppressApi404[T](block: => Option[T])(implicit log: Logger): Option[T] = {
    try
      block
    catch {
      case ApiError(404, _) =>
        log.info("Got a 404 while calling content api")
        None
    }
  }
}