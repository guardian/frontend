package common.facia

import com.gu.facia.api.utils.BoostLevel
import model.facia.PressedCollection
import model.{FrontProperties, PressedPage, SeoData}
import model.pressed._
import model.ContentFormat

object FixtureBuilder {

  def mkContent(id: Int): PressedContent = FixtureBuilder.mkPressedCuratedContent(id)

  def mkPressedCollection(
      id: String,
      curated: Seq[PressedContent] = IndexedSeq.empty,
      backfill: Seq[PressedContent] = IndexedSeq.empty,
      maxItemsToDisplay: Option[Int] = None,
  ): PressedCollection = {
    PressedCollection(
      id = "test-collection",
      displayName = s"Test Collection $id",
      curated = curated.toList,
      backfill = backfill.toList,
      treats = List.empty,
      lastUpdated = None,
      href = None,
      description = None,
      collectionType = "unknown",
      uneditable = false,
      showTags = false,
      showSections = false,
      hideKickers = false,
      showDateHeader = false,
      showLatestUpdate = false,
      config = CollectionConfig.empty.copy(displayHints = maxItemsToDisplay.map(m => DisplayHints(Some(m)))),
      hasMore = false,
      targetedTerritory = None,
    )
  }

  def mkPressedPage(collections: List[PressedCollection]): PressedPage = {
    PressedPage(
      id = "test-pressed-page",
      seoData = SeoData.empty,
      frontProperties = FrontProperties.empty,
      collections = collections,
    )
  }

  def mkProperties(id: Int): PressedProperties =
    PressedProperties(
      isBreaking = false,
      mediaSelect = MediaSelect(
        showMainVideo = false,
        imageSlideshowReplace = false,
        videoReplace = false,
      ),
      showKickerTag = false,
      showByline = false,
      maybeContent = None,
      maybeContentId = Some(id.toString),
      isLiveBlog = false,
      isCrossword = false,
      byline = None,
      image = None,
      webTitle = s"webTitle $id",
      linkText = None,
      embedType = None,
      embedCss = None,
      embedUri = None,
      maybeFrontPublicationDate = None,
      href = None,
      webUrl = None,
      editionBrandings = None,
      atomId = None,
    )

  def mkHeader(id: Int, kicker: Option[ItemKicker] = None): PressedCardHeader =
    PressedCardHeader(
      isVideo = false,
      isComment = false,
      isGallery = false,
      isAudio = false,
      kicker,
      seriesOrBlogKicker = None,
      headline = "",
      url = id.toString,
      hasMainVideoElement = None,
    )

  def mkCard(id: Int): PressedCard =
    PressedCard(
      id.toString,
      cardStyle = DefaultCardstyle,
      webPublicationDateOption = None,
      lastModifiedOption = None,
      trailText = Some("trail text"),
      mediaType = None,
      starRating = None,
      shortUrlPath = None,
      shortUrl = "",
      group = "0",
      isLive = false,
      galleryCount = None,
      audioDuration = None,
    )

  def mkDiscussion(): PressedDiscussionSettings =
    PressedDiscussionSettings(
      isCommentable = false,
      isClosedForComments = false,
      discussionId = None,
    )

  def mkDisplay(): PressedDisplaySettings =
    PressedDisplaySettings(
      isBoosted = false,
      boostLevel = Some(BoostLevel.Default),
      isImmersive = Some(false),
      showBoostedHeadline = false,
      showQuotedHeadline = false,
      imageHide = false,
      showLivePlayable = false,
    )

  def mkPressedCuratedContent(id: Int, kicker: Option[ItemKicker] = None): PressedContent = {

    CuratedContent(
      properties = mkProperties(id),
      header = mkHeader(id, kicker),
      card = mkCard(id),
      discussion = mkDiscussion(),
      display = mkDisplay(),
      enriched = None,
      supportingContent = Nil,
      cardStyle = DefaultCardstyle,
      format = ContentFormat.defaultContentFormat,
      mediaAtom = None,
    )
  }

  def mkPressedLinkSnap(id: Int, kicker: Option[ItemKicker] = None): PressedContent = {

    LinkSnap(
      properties = mkProperties(id),
      header = mkHeader(id, kicker),
      card = mkCard(id),
      discussion = mkDiscussion(),
      display = mkDisplay(),
      enriched = None,
      format = ContentFormat.defaultContentFormat,
      mediaAtom = None,
    )
  }
}
