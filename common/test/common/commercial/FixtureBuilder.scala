package common.commercial

import model.pressed._

object FixtureBuilder {

  def mkPressedContent(id: Int, kicker: Option[ItemKicker] = None): PressedContent = {

    def mkProperties(): PressedProperties = PressedProperties(
      isBreaking = false,
      showMainVideo = false,
      showKickerTag = false,
      showByline = false,
      imageSlideshowReplace = false,
      maybeContent = None,
      maybeContentId = Some(id.toString),
      isLiveBlog = false,
      isCrossword = false,
      byline = None,
      image = None,
      maybeSection = None,
      webTitle = "",
      linkText = None,
      embedType = None,
      embedCss = None,
      embedUri = None,
      section = "",
      maybeFrontPublicationDate = None,
      href = None,
      webUrl = None
    )

    def mkHeader(): PressedCardHeader = PressedCardHeader(
      isVideo = false,
      isComment = false,
      isGallery = false,
      isAudio = false,
      kicker,
      seriesOrBlogKicker = None,
      headline = "",
      url = id.toString,
      hasMainVideoElement = None
    )

    def mkCard(): PressedCard = PressedCard(
      id.toString,
      cardStyle = DefaultCardstyle,
      webPublicationDateOption = None,
      trailText = None,
      mediaType = None,
      starRating = None,
      shortUrlPath = None,
      shortUrl = "",
      group = "0",
      isLive = false
    )

    def mkDiscussion(): PressedDiscussionSettings = PressedDiscussionSettings(
      isCommentable = false,
      isClosedForComments = false,
      discussionId = None
    )

    def mkDisplay(): PressedDisplaySettings = PressedDisplaySettings(
      isBoosted = false,
      showBoostedHeadline = false,
      showQuotedHeadline = false,
      imageHide = false,
      showLivePlayable = false
    )

    CuratedContent(
      properties = mkProperties(),
      header = mkHeader(),
      card = mkCard(),
      discussion = mkDiscussion(),
      display = mkDisplay(),
      enriched = None,
      supportingContent = Nil,
      cardStyle = DefaultCardstyle
    )
  }
}
