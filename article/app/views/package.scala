package views

import common.Edition
import layout.ContentWidths.MainMedia
import model.Article
import play.api.mvc.RequestHeader
import views.support._
import views.support.cleaner.{VideoEmbedCleaner, CmpParamCleaner, AmpAdCleaner}

object MainMediaWidths {

  def apply(article: Article): layout.WidthsByBreakpoint = {
    (article.hasShowcaseMainElement, article.isFeature) match {
      case (true, true) => MainMedia.FeatureShowcase
      case (true, _) => MainMedia.Showcase
      case _ => MainMedia.Inline
    }
  }

}

object MainCleaner {
 def apply(article: Article, html: String, amp: Boolean)(implicit request: RequestHeader) = {
      implicit val edition = Edition(request)
      withJsoup(BulletCleaner(html))(
        VideoEmbedCleaner(article, amp),
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
      InBodyLinkCleaner("in body link"),
      BlockNumberCleaner,
      new TweetCleaner(article, amp),
      WitnessCleaner,
      TagLinker(article),
      TableEmbedComplimentaryToP,
      R2VideoCleaner(article),
      VideoEmbedCleaner(article, amp),
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
    withJsoup(BulletCleaner(html))((if (amp) AmpAdCleaner :: cleaners else cleaners) :_*)
  }
}
