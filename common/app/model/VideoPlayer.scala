package model

import conf.Static
import views.support.{Video640, VideoProfile}
import layout.FaciaCardHeader

case class VideoFaciaProperties(
  header: layout.FaciaCardHeader,
  showByline: Boolean,
  byline: String
)

case class VideoPlayer(
  video: VideoElement,
  profile: VideoProfile,
  title: String,
  autoPlay: Boolean,
  showControlsAtStart: Boolean,
  endSlatePath: String,
  overrideIsRatioHd: Option[Boolean] = None,
  embedPath: Option[String] = None,
  hasFaciaHeader: Boolean = false,
  faciaHeaderProperties: Option[VideoFaciaProperties] = None
) {
  def poster = profile.bestFor(video.images).getOrElse(Static("images/media-holding.jpg").path)

  /** Width and height are always defined for video profile, so this is OK. */
  def width = profile.width.get
  def height = profile.width.get

  def showEndSlate = width >= Video640.width.get

  def isRatioHd = overrideIsRatioHd getOrElse profile.isRatioHD

  def blockVideoAds = video.videos.blockVideoAds
}

object VideoPlayer{
  def apply(
    video: VideoElement,
    profile: VideoProfile,
    content: model.pressed.PressedContent,
    autoPlay: Boolean,
    showControlsAtStart: Boolean
  ) : VideoPlayer = { VideoPlayer(
    video,
    profile,
    content.header.headline,
    autoPlay,
    showControlsAtStart,
    endSlatePath = SupportedUrl.fromFaciaContent(content),
    hasFaciaHeader = true,
    faciaHeaderProperties = Some(VideoFaciaProperties(
      header = FaciaCardHeader.fromTrail(content, None),
      showByline = content.properties.showByline,
      byline = content.properties.byline.get
    ))
  )}
}
