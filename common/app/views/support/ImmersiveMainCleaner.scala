package views.support

import common.Edition
import model.content.MediaWrapper
import model.{ApplicationContext, Article}
import play.api.mvc.RequestHeader
import play.twirl.api.Html

object ImmersiveMainCleaner {
  def apply(article: Article, html: String)(implicit request: RequestHeader, context: ApplicationContext): Html = {
    implicit val edition: Edition = Edition(request)
    withJsoup(BulletCleaner(html))(
      AtomsCleaner(article.content.atoms, shouldFence = true, mediaWrapper = Some(MediaWrapper.ImmersiveMainMedia)),
    )
  }
}
