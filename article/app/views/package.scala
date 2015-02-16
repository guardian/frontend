package views

import common.Edition
import model.Article
import play.api.mvc.RequestHeader
import support._

object BodyCleaner {
  def apply(article: Article, html: String)(implicit request: RequestHeader) = {
      implicit val edition = Edition(request)
      withJsoup(BulletCleaner(html))(
        InBodyElementCleaner,
        InBodyLinkCleaner("in body link"),
        BlockNumberCleaner,
        TweetCleaner,
        WitnessCleaner,
        new TagLinker(article),
        TableEmbedComplimentaryToP,
        R2VideoCleaner(article),
        VideoEmbedCleaner(article),
        PictureCleaner(article),
        LiveBlogDateFormatter(article.isLiveBlog),
        LiveBlogShareButtons(article),
        DropCaps(article.isComment || article.isFeature),
        FigCaptionCleaner,
        RichLinkCleaner
      )
  }
}
