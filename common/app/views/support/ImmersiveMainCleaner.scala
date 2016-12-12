package views.support

import common.Edition
import model.Article
import play.api.Environment
import play.api.mvc.RequestHeader

object ImmersiveMainCleaner {
  def apply(article: Article, html: String, amp: Boolean)(implicit request: RequestHeader, env: Environment) = {
    implicit val edition = Edition(request)
    withJsoup(BulletCleaner(html))(
      AtomsCleaner(article.content.atoms, shouldFence = true, amp)
    )
  }
}
