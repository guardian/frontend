package views.support

import common.Edition
import model.{ApplicationContext, Article}
import play.api.mvc.RequestHeader

object ImmersiveMainCleaner {
  def apply(article: Article, html: String, amp: Boolean)(implicit request: RequestHeader, context: ApplicationContext) = {
    implicit val edition = Edition(request)
    withJsoup(BulletCleaner(html))(
      AtomsCleaner(article.content.atoms, shouldFence = true, amp, immersiveMainMedia = true)
    )
  }
}
