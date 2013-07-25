package views

import model.Article
import play.api.mvc.RequestHeader
import views.support._
import common.Edition
import views.support.PictureCleaner
import views.support.VideoPosterCleaner
import views.support.InBodyLinkCleaner


object BodyCleaner {
  def apply(article: Article)(implicit request: RequestHeader) = withJsoup(BulletCleaner(article.body))(
    InBodyElementCleaner,
    PictureCleaner(article),
    InBodyLinkCleaner("in body link")(Edition(request)),
    BlockNumberCleaner,
    TweetCleaner,
    WitnessCleaner,
    VideoEmbedCleaner,
    VideoPosterCleaner(article.videoAssets)
  )
}
