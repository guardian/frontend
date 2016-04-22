package views

import common.Edition
import layout.ContentWidths
import layout.ContentWidths.{Inline, Showcase, MainMedia, LiveBlogMedia}
import model.Article
import play.api.mvc.RequestHeader
import views.support._
import views.support.cleaner.{AmpEmbedCleaner, VideoEmbedCleaner, CmpParamCleaner, AmpAdCleaner}

object MainMediaWidths {

  def apply(article: Article): layout.WidthsByBreakpoint = {
    if (article.elements.hasShowcaseMainElement && article.tags.isFeature) {
      MainMedia.featureShowcase
    } else {
      val hinting = if (article.elements.hasShowcaseMainElement) { Showcase } else { Inline }
      val relation = if (article.isLiveBlog) { LiveBlogMedia } else { MainMedia }
      ContentWidths.getWidthsFromContentElement(hinting, relation)
    }
  }

}

object MainCleaner {
 def apply(article: Article, html: String, amp: Boolean)(implicit request: RequestHeader) = {
      implicit val edition = Edition(request)
      withJsoup(BulletCleaner(html))(
        if (amp) AmpEmbedCleaner(article) else VideoEmbedCleaner(article),
        PictureCleaner(article, amp),
        ImmersiveMainEmbed(article.isImmersive, article.isSixtyDaysModified),
        MainFigCaptionCleaner
      )
  }
}

object BodyCleaner {
  def apply(article: Article, html: String, amp: Boolean)(implicit request: RequestHeader) = {
    implicit val edition = Edition(request)

    val shouldShowAds = !article.content.shouldHideAdverts && article.metadata.section != "childrens-books-site"
    def ListIf[T](condition: Boolean)(value: => T): List[T] = if(condition) List(value) else Nil

    val cleaners = List(
      InBodyElementCleaner,
      InBodyLinkCleaner("in body link", amp),
      BlockNumberCleaner,
      new TweetCleaner(article.content, amp),
      WitnessCleaner,
      TagLinker(article),
      TableEmbedComplimentaryToP,
      R2VideoCleaner,
      PictureCleaner(article, amp),
      AtomsCleaner(article.content.atoms),
      DropCaps(article.tags.isComment || article.tags.isFeature, article.isImmersive),
      ImmersiveHeaders(article.isImmersive),
      FigCaptionCleaner,
      RichLinkCleaner,
      MembershipEventCleaner,
      BlockquoteCleaner,
      ChaptersLinksCleaner,
      PullquoteCleaner,
      CmpParamCleaner,
      ImmersiveLinks(article.isImmersive),
      TimestampCleaner(article),
      MinuteCleaner(article)
    ) ++
      ListIf(!amp)(VideoEmbedCleaner(article)) ++
      ListIf(amp)(AmpEmbedCleaner(article)) ++
      ListIf(amp && shouldShowAds)(AmpAdCleaner(edition, request.uri, article))

    withJsoup(BulletCleaner(html))(cleaners :_*)
  }
}
