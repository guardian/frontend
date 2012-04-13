package content

import com.gu.openplatform.contentapi.ApiError
import com.gu.openplatform.contentapi.model.{Content => ApiContent}
import conf.Logging

object `package` extends Logging {

  implicit def content2IsArticle(content: ApiContent) = new {
    lazy val isArticle = content.tags.exists(_.id == "type/article")
  }

  def suppressApi404(block: => Option[Article]) = {
    try {
      block
    } catch {
      case ApiError(404, _) =>
        log.info("Got a 404 while calling content api")
        None
    }
  }
}