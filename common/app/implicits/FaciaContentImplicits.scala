package implicits

import com.gu.contentapi.client.model.{Element, Tag, Content}
import com.gu.facia.api.models.FaciaContent
import com.gu.facia.api.utils.{MediaType, ItemKicker, FaciaContentUtils, CardStyle}
import org.joda.time.DateTime

object FaciaContentImplicits {

  implicit class FaciaContentImplicit(fc: FaciaContent) {

    def maybeContent: Option[Content] = FaciaContentUtils.maybeContent(fc)
    def tags: List[com.gu.contentapi.client.model.Tag] = FaciaContentUtils.tags(fc)
    def webPublicationDateOption: Option[DateTime] = FaciaContentUtils.webPublicationDateOption(fc)
    def webPublicationDate: DateTime = FaciaContentUtils.webPublicationDate(fc)

    def id: String = FaciaContentUtils.id(fc)
    def maybeContentId = FaciaContentUtils.maybeContentId(fc)

    def embedType: Option[String] = FaciaContentUtils.embedType(fc)
    def embedCss: Option[String] = FaciaContentUtils.embedCss(fc)
    def embedUri: Option[String] = FaciaContentUtils.embedUri(fc)

    def itemKicker: Option[ItemKicker] = FaciaContentUtils.itemKicker(fc)

    def headlineOption: Option[String] = FaciaContentUtils.headlineOption(fc)
    def headline: String = FaciaContentUtils.headline(fc)

    def standfirst: Option[String] = FaciaContentUtils.standfirst(fc)

    def body: Option[String] = FaciaContentUtils.body(fc)

    def webUrl: Option[String] = FaciaContentUtils.webUrl(fc)

    val DefaultSnapHref: String = "/"
    def href: Option[String] = FaciaContentUtils.href(fc)

    def mediaType: Option[MediaType] = FaciaContentUtils.mediaType(fc)

    def isLiveBlog: Boolean = FaciaContentUtils.isLiveBlog(fc)

    def isLive: Boolean = FaciaContentUtils.isLive(fc)

    def isPodcast: Boolean = FaciaContentUtils.isPodcast(fc)

    def isMedia: Boolean = FaciaContentUtils.isMedia(fc)

    def isEditorial: Boolean = FaciaContentUtils.isEditorial(fc)

    def isComment: Boolean = FaciaContentUtils.isComment(fc)

    def isAnalysis: Boolean = FaciaContentUtils.isAnalysis(fc)

    def isReview: Boolean = FaciaContentUtils.isReview(fc)

    def isLetters: Boolean = FaciaContentUtils.isLetters(fc)

    def isFeature: Boolean = FaciaContentUtils.isFeature(fc)

    def isCommentable = FaciaContentUtils.isCommentable(fc)
    def commentCloseDate = FaciaContentUtils.commentCloseDate(fc)

    def maybeShortUrl = FaciaContentUtils.maybeShortUrl(fc)
    def shortUrl: String = FaciaContentUtils.shortUrl(fc)
    def shortUrlPath = FaciaContentUtils.shortUrlPath(fc)
    def discussionId = FaciaContentUtils.discussionId(fc)
    def isBoosted: Boolean = FaciaContentUtils.isBoosted(fc)

    def showBoostedHeadline: Boolean = FaciaContentUtils.showBoostedHeadline(fc)

    def showQuotedHeadline: Boolean = FaciaContentUtils.showQuotedHeadline(fc)

    def showMainVideo: Boolean = FaciaContentUtils.showMainVideo(fc)

    def showLivePlayable: Boolean = FaciaContentUtils.showLivePlayable(fc)

    def sectionName: Option[String] = FaciaContentUtils.sectionName(fc)

    def maybeSection: Option[String] = FaciaContentUtils.maybeSection(fc)

    def section: String = FaciaContentUtils.section(fc)

    def byline: Option[String] = FaciaContentUtils.byline(fc)

    def showByline: Boolean = FaciaContentUtils.showByline(fc)

    def keywords: Seq[Tag] = FaciaContentUtils.keywords(fc)
    def nonKeywordTags: Seq[Tag] = FaciaContentUtils.nonKeywordTags(fc)
    def contributors: Seq[Tag] = FaciaContentUtils.contributors(fc)
    def isContributorPage: Boolean = FaciaContentUtils.isContributorPage(fc)
    def series: Seq[Tag] = FaciaContentUtils.series(fc)
    def blogs: Seq[Tag] = FaciaContentUtils.blogs(fc)
    def tones: Seq[Tag] = FaciaContentUtils.tones(fc)
    def types: Seq[Tag] = FaciaContentUtils.types(fc)
    def isVideo: Boolean = FaciaContentUtils.isVideo(fc)
    def isGallery: Boolean = FaciaContentUtils.isGallery(fc)
    def isAudio: Boolean = FaciaContentUtils.isAudio(fc)
    def isCartoon: Boolean = FaciaContentUtils.isCartoon(fc)
    def isArticle: Boolean = FaciaContentUtils.isArticle(fc)
    def isCrossword: Boolean = FaciaContentUtils.isCrossword(fc)

    def supporting: List[FaciaContent] = FaciaContentUtils.supporting(fc)

    def starRating: Option[Int] = FaciaContentUtils.starRating(fc)

    def trailText: Option[String] = FaciaContentUtils.trailText(fc)

    def maybeWebTitle: Option[String] = FaciaContentUtils.maybeWebTitle(fc)

    def webTitle: String = FaciaContentUtils.webTitle(fc)

    def linkText = FaciaContentUtils.linkText(fc)

    def elements: List[Element] = FaciaContentUtils.elements(fc)
    def cardStyle: CardStyle = FaciaContentUtils.cardStyle(fc)

    def isClosedForComments = FaciaContentUtils.isClosedForComments(fc)
    def image = FaciaContentUtils.image(fc)

    def properties = FaciaContentUtils.properties(fc)
    def imageHide = FaciaContentUtils.properties(fc).exists(_.imageHide)
    def imageSlideshowReplace = FaciaContentUtils.properties(fc).exists(_.imageSlideshowReplace)
    def group = FaciaContentUtils.group(fc)
    def maybeFrontPublicationDate = FaciaContentUtils.maybeFrontPublicationDate(fc)
  }
}
