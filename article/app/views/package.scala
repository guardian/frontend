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
        PictureCleaner(article.bodyImages),
        InBodyLinkCleaner("in body link"),
        InBodyLinkDataComponentCleaner,
        BlockNumberCleaner,
        TweetCleaner,
        WitnessCleaner,
        VideoEmbedCleaner(article.bodyVideos),
        new TagLinker(article),
        TableEmbedComplimentaryToP,
        LiveBlogDateFormatter(article.isLiveBlog),
        LiveBlogShareButtons(article),
        DropCaps(article.isComment || article.isFeature),
        FigCaptionCleaner
      )
  }
}
