package views

import common.Edition
import model.Article
import play.api.mvc.RequestHeader
import support._

object BodyCleaner {
  def apply(article: Article, html: String)(implicit request: RequestHeader) = withJsoup(BulletCleaner(html))(
    InBodyElementCleaner,
    PictureCleaner(article.bodyImages),
    InBodyLinkCleaner("in body link")(Edition(request)),
    BlockNumberCleaner,
    TweetCleaner,
    WitnessCleaner,
    VideoEmbedCleaner(article.bodyVideos),
    new TagLinker(article),
    TableEmbedComplimentaryToP,
    LiveBlogDateFormatter(article.isLiveBlog),
    DropCaps(article.isComment || article.isFeature)
  )
}
