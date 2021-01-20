package views

import common.commercial.hosted.HostedArticlePage
import model.ApplicationContext
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.support.{AtomsCleaner, withJsoup}

object CommercialBodyCleaner {
  def apply(article: HostedArticlePage, html: String)(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): Html = {

    val cleaners = List(
      AtomsCleaner(atoms = article.content.atoms),
    )

    withJsoup(html)(cleaners: _*)
  }
}
