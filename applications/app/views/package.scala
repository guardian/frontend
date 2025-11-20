package views

import common.Edition
import model.{ApplicationContext, GalleryPage, Interactive}
import org.jsoup.Jsoup
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import services.IndexPage
import views.support._

object InteractiveBodyCleaner {
  def apply(interactive: Interactive)(implicit request: RequestHeader, context: ApplicationContext): Html = {
    val html = interactive.fields.body
    val cleaners = List(
      AtomsCleaner(interactive.content.atoms, shouldFence = false),
    ) ++ (if (interactive.content.isImmersive) List(InteractiveSrcdocCleaner) else Nil)

    withJsoup(html)(cleaners: _*)
  }
}

object IndexCleaner {
  def apply(page: IndexPage, html: Html)(implicit request: RequestHeader, context: ApplicationContext): Html = {
    val edition = Edition(request)
    withJsoup(BulletCleaner(html.toString))(
      CommercialComponentHigh(
        isPaidContent = false,
        isNetworkFront = false,
        hasPageSkin = page.page.metadata.hasPageSkin(request),
      ),
      CommercialMPUForFronts(),
    )
  }
}

object GalleryCaptionCleaners {
  def apply(page: GalleryPage, caption: String, isFirstRow: Boolean)(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): Html = {
    val cleaners = List(
      GalleryCaptionCleaner,
      AffiliateLinksCleaner(
        request.uri,
        page.gallery.content.fields.showAffiliateLinks,
        appendDisclaimer = Some(isFirstRow && page.item.lightbox.containsAffiliateableLinks),
        tags = page.gallery.content.tags.tags.map(_.id),
        page.gallery.content.isUSProductionOffice,
      ),
    )

    val cleanedHtml = cleaners.foldLeft(Jsoup.parseBodyFragment(caption)) { case (html, cleaner) =>
      cleaner.clean(html)
    }
    cleanedHtml.outputSettings().prettyPrint(false)
    Html(cleanedHtml.body.html)
  }

}
