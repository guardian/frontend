package model

import conf.Static
import views.support.{Video640, VideoProfile}
import layout.FaciaCardHeader

case class VideoFaciaProperties(
  header: layout.FaciaCardHeader,
  showByline: Boolean,
  byline: Option[String]
)

case class VideoPlayer(
  video: VideoElement,
  profile: VideoProfile,
  title: String,
  autoPlay: Boolean,
  showControlsAtStart: Boolean,
  // TODO make Option[String] as relies on section being set
  endSlatePath: String,
  // TODO make `String` once `path` is available on main media on fronts
  path: Option[String],
  overrideIsRatioHd: Option[Boolean] = None,
  embedPath: Option[String] = None,
  hasFaciaHeader: Boolean = false,
  faciaHeaderProperties: Option[VideoFaciaProperties] = None
) {
  def poster: String = profile.bestFor(video.images).getOrElse(Static("images/media-holding.jpg"))

  /** Width and height are always defined for video profile, so this is OK. */
  def width: Int = profile.width.get
  def height: Int = profile.width.get

  def showEndSlate: Boolean = width >= Video640.width.get

  def isRatioHd: Boolean = overrideIsRatioHd getOrElse profile.isRatioHD

  def blockVideoAds: Boolean = video.videos.blockVideoAds
}

object VideoPlayer {
  def apply(
    video: VideoElement,
    profile: VideoProfile,
    content: model.pressed.PressedContent,
    autoPlay: Boolean,
    showControlsAtStart: Boolean,
    path: Option[String]
  ) : VideoPlayer = { VideoPlayer(
    video,
    profile,
    content.header.headline,
    autoPlay,
    showControlsAtStart,
    endSlatePath = SupportedUrl.fromFaciaContent(content),
    path,
    hasFaciaHeader = true,
    faciaHeaderProperties = Some(VideoFaciaProperties(
      header = FaciaCardHeader.fromTrail(content, None),
      showByline = content.properties.showByline,
      byline = content.properties.byline
    ))
  )}
}
