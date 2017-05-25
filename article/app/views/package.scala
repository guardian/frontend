package views

import common.Edition
import layout.ContentWidths
import layout.ContentWidths.{Inline, LiveBlogMedia, MainMedia, Showcase}
import model.content.MediaWrapper
import model.{ApplicationContext, Article}
import play.api.mvc.RequestHeader
import views.support._
import views.support.cleaner._

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
 def apply(article: Article, html: String, amp: Boolean)(implicit request: RequestHeader, context: ApplicationContext) = {
      implicit val edition = Edition(request)
      withJsoup(BulletCleaner(html))(
        if (amp) AmpEmbedCleaner(article) else VideoEmbedCleaner(article),
        PictureCleaner(article, amp),
        MainFigCaptionCleaner,
        AtomsCleaner(atoms = article.content.atoms, amp = amp, mediaWrapper = Some(MediaWrapper.MainMedia))
      )
  }
}

object BodyCleaner {
  def apply(article: Article, html: String, amp: Boolean)(implicit request: RequestHeader, context: ApplicationContext) = {
    implicit val edition = Edition(request)

    val shouldShowAds = !article.content.shouldHideAdverts && article.metadata.sectionId != "childrens-books-site"
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
      AtomsCleaner(atoms = article.content.atoms, shouldFence = true, amp = amp),
      DropCaps(article.tags.isComment || article.tags.isFeature, article.isImmersive),
      ImmersiveHeaders(article.isImmersive),
      FigCaptionCleaner,
      RichLinkCleaner(amp),
      MembershipEventCleaner,
      BlockquoteCleaner,
      PullquoteCleaner,
      CmpParamCleaner,
      ExploreVideos(article.isExplore),
      PhotoEssayImages(article.isPhotoEssay),
      PhotoEssayQuotes(article.isPhotoEssay),
      PhotoEssayHalfWidth(article.isPhotoEssay),
      PhotoEssayBlockQuote(article.isPhotoEssay),
      PhotoEssayCaptions(article.isPhotoEssay),
      ImmersiveLinks(article.isImmersive),
      TimestampCleaner(article),
      MinuteCleaner(article)
    ) ++
      ListIf(!amp)(ExplainerCleaner(article.atoms.map(_.explainers).getOrElse(Nil))) ++
      ListIf(!amp)(VideoEmbedCleaner(article)) ++
      ListIf(amp)(AmpEmbedCleaner(article)) ++
      ListIf(amp && shouldShowAds && !article.isLiveBlog)(AmpAdCleaner(edition, request.uri, article))

    withJsoup(BulletCleaner(html))(cleaners :_*)
  }
}
