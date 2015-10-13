package views

import common.Edition
import layout.ContentWidths.{MainMedia, LiveBlogMedia}
import model.Article
import play.api.mvc.RequestHeader
import views.support._
import views.support.cleaner.{AmpEmbedCleaner, VideoEmbedCleaner, CmpParamCleaner, AmpAdCleaner}

object MainMediaWidths {

  def apply(article: Article): layout.WidthsByBreakpoint = {
    (article.hasShowcaseMainElement, article.isFeature, article.isLiveBlog) match {
      case (true, true, _) => MainMedia.FeatureShowcase
      case (true, false, _) => MainMedia.Showcase
      case (false, _, true) => LiveBlogMedia.Inline
      case _ => MainMedia.Inline
    }
  }

}

object MainCleaner {
 def apply(article: Article, html: String, amp: Boolean)(implicit request: RequestHeader) = {
      implicit val edition = Edition(request)
      withJsoup(BulletCleaner(html))(
        if (amp) AmpEmbedCleaner(article) else VideoEmbedCleaner(article),
        PictureCleaner(article, amp),
        MainFigCaptionCleaner
      )
  }
}

object BodyCleaner {
  def apply(article: Article, html: String, amp: Boolean)(implicit request: RequestHeader) = {
    implicit val edition = Edition(request)
    val cleaners = List(
      InBodyElementCleaner,
      InBodyLinkCleaner("in body link", amp),
      BlockNumberCleaner,
      new TweetCleaner(article, amp),
      WitnessCleaner,
      TagLinker(article),
      TableEmbedComplimentaryToP,
      R2VideoCleaner(article),
      PictureCleaner(article, amp),
      LiveBlogDateFormatter(article.isLiveBlog),
      LiveBlogLinkedData(article.isLiveBlog),
      BloggerBylineImage(article),
      LiveBlogShareButtons(article),
      DropCaps(article.isComment || article.isFeature),
      FigCaptionCleaner,
      RichLinkCleaner,
      MembershipEventCleaner,
      BlockquoteCleaner,
      ChaptersLinksCleaner,
      PullquoteCleaner,
      CmpParamCleaner
    )
    val nonAmpCleaners = List(
      VideoEmbedCleaner(article)
    )
    val ampOnlyCleaners = List(
      AmpAdCleaner,
      AmpEmbedCleaner(article)
    )
    withJsoup(BulletCleaner(html))((if (amp) ampOnlyCleaners else nonAmpCleaners) ++ cleaners :_*)
  }
}
