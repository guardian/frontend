package views

import common.Edition
import model.Article
import play.api.mvc.RequestHeader
import views.support._

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
        TweetCleaner,
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
