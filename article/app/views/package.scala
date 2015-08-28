package views

import common.Edition
import layout.ContentWidths.MainMedia
import model.Article
import play.api.mvc.RequestHeader
import views.support._

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
 def apply(article: Article, html: String)(implicit request: RequestHeader) = {
      implicit val edition = Edition(request)
      withJsoup(BulletCleaner(html))(
        VideoEmbedCleaner(article),
        PictureCleaner(article),
        MainFigCaptionCleaner
      )
  }
}

object BodyCleaner {
  def apply(article: Article, html: String)(implicit request: RequestHeader) = {
      implicit val edition = Edition(request)
      withJsoup(BulletCleaner(html))(
        InBodyElementCleaner,
        InBodyLinkCleaner("in body link"),
        BlockNumberCleaner,
        new TweetCleaner(article),
        WitnessCleaner,
        TagLinker(article),
        TableEmbedComplimentaryToP,
        R2VideoCleaner(article),
        VideoEmbedCleaner(article),
        PictureCleaner(article),
        LiveBlogDateFormatter(article.isLiveBlog),
        LiveBlogLinkedData(article.isLiveBlog),
        BloggerBylineImage(article),
        LiveBlogShareButtons(article),
        DropCaps(article.isComment || article.isFeature),
        FigCaptionCleaner,
        RichLinkCleaner,
        MembershipEventCleaner,
        BlockquoteCleaner,
        CmpParamCleaner
      )
  }
}
