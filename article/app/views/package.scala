package views

import common.Edition
import layout.ContentWidths
import layout.ContentWidths.{Inline, LiveBlogMedia, MainMedia, Showcase}
import model.content.MediaWrapper
import model.{ApplicationContext, Article}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
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
 def apply(article: Article)(implicit request: RequestHeader, context: ApplicationContext): Html = {
      implicit val edition: Edition = Edition(request)
      withJsoup(BulletCleaner(article.fields.main))(
        VideoEmbedCleaner(article),
        PictureCleaner(article, false),
        MainFigCaptionCleaner,
        AtomsCleaner(
          atoms = article.content.atoms,
          amp = false,
          mediaWrapper = Some(MediaWrapper.MainMedia),
          posterImageOverride = article.elements.thumbnail.map(_.images)
        )
      )
  }
}

object BodyCleaner {

  def cleaners(article: Article, amp: Boolean)(implicit request: RequestHeader, context: ApplicationContext): List[HtmlCleaner] = {
    implicit val edition: Edition = Edition(request)

    val shouldShowAds = !article.content.shouldHideAdverts && article.metadata.sectionId != "childrens-books-site"
    def ListIf[T](condition: Boolean)(value: => T): List[T] = if(condition) List(value) else Nil

    List(
      InBodyElementCleaner,
      AtomsCleaner(atoms = article.content.atoms, shouldFence = true, amp = amp),
      InBodyLinkCleaner("in body link", amp),
      BlockNumberCleaner,
      new TweetCleaner(article.content, amp),
      WitnessCleaner,
      TableEmbedComplimentaryToP,
      R2VideoCleaner,
      PictureCleaner(article, amp),
      DropCaps(article.tags.isComment || article.tags.isFeature, article.isImmersive),
      TagLinker(article),
      ImmersiveHeaders(article.isImmersive),
      FigCaptionCleaner,
      RichLinkCleaner(amp),
      MembershipEventCleaner,
      BlockquoteCleaner,
      PullquoteCleaner,
      CmpParamCleaner,
      PhotoEssayImages(article.isPhotoEssay),
      PhotoEssayQuotes(article.isPhotoEssay),
      PhotoEssayHalfWidth(article.isPhotoEssay),
      PhotoEssayBlockQuote(article.isPhotoEssay),
      PhotoEssayCaptions(article.isPhotoEssay),
      ImmersiveLinks(article.isImmersive),
      NumberedListFurniture(article.isNumberedList),
      TimestampCleaner(article),
      MinuteCleaner(article),
      GarnettQuoteCleaner,
      AffiliateLinksCleaner(request.uri, article.content.metadata.sectionId, article.content.fields.showAffiliateLinks, "article", tags = article.content.tags.tags.map(_.id))
    ) ++
      ListIf(!amp)(VideoEmbedCleaner(article)) ++
      ListIf(amp)(AmpEmbedCleaner(article)) ++
      ListIf(amp)(AttributeCleaner("style")) ++ // The inline 'style' attribute is not allowed in AMP documents
      ListIf(amp && shouldShowAds && !article.isLiveBlog)(AmpAdCleaner(edition, request.uri, article))
  }

  def apply(article: Article, amp: Boolean)(implicit request: RequestHeader, context: ApplicationContext): Html = {

    withJsoup(BulletCleaner(article.fields.body))(cleaners(article, amp) :_*)
  }

  def apply(article: Article, html: String, amp: Boolean)(implicit request: RequestHeader, context: ApplicationContext): Html = {

    withJsoup(BulletCleaner(html))(cleaners(article, amp) :_*)
  }
}
