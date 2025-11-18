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
      val hinting = if (article.elements.hasShowcaseMainElement) { Showcase }
      else { Inline }
      val relation = if (article.isLiveBlog) { LiveBlogMedia }
      else { MainMedia }
      ContentWidths.getWidthsFromContentElement(hinting, relation)
    }
  }

}

object MainCleaner {
  def apply(article: Article)(implicit request: RequestHeader, context: ApplicationContext): Html = {
    implicit val edition: Edition = Edition(request)
    withJsoup(BulletCleaner(article.fields.main))(
      VideoEmbedCleaner(article),
      PictureCleaner(article),
      MainFigCaptionCleaner,
      AtomsCleaner(
        atoms = article.content.atoms,
        mediaWrapper = Some(MediaWrapper.MainMedia),
        posterImageOverride = article.elements.thumbnail.map(_.images),
      ),
    )
  }
}

object BodyProcessor {

  def cleaners(article: Article)(implicit request: RequestHeader, context: ApplicationContext): List[HtmlCleaner] = {
    implicit val edition: Edition = Edition(request)

    def ListIf[T](condition: Boolean)(value: => T): List[T] = if (condition) List(value) else Nil

    List(
      InBodyElementCleaner,
      AtomsCleaner(atoms = article.content.atoms),
      InBodyLinkCleaner("in body link"),
      BlockNumberCleaner,
      new TweetCleaner(article.content),
      WitnessCleaner,
      TableEmbedComplimentaryToP,
      R2VideoCleaner,
      PictureCleaner(article),
      DropCaps(article.tags.isComment || article.tags.isFeature, article.isImmersive),
      TagLinker(article),
      ImmersiveHeaders(article.isImmersive),
      FigCaptionCleaner,
      RichLinkCleaner(),
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
      AffiliateLinksCleaner(
        pageUrl = request.uri,
        showAffiliateLinks = article.content.fields.showAffiliateLinks,
        tags = article.content.tags.tags.map(_.id),
        isUSProductionOffice = article.content.isUSProductionOffice,
      ),
    ) ++
      ListIf(true)(VideoEmbedCleaner(article))
  }

  def apply(article: Article)(implicit request: RequestHeader, context: ApplicationContext): Html = {
    withJsoup(BulletCleaner(article.fields.body))(cleaners(article): _*)
  }

  def apply(article: Article, html: String)(implicit request: RequestHeader, context: ApplicationContext): Html = {
    withJsoup(BulletCleaner(html))(cleaners(article): _*)
  }
}
