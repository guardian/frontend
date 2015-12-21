package model

import conf.Static
import views.support.{Video640, VideoProfile}

case class VideoPlayer(
  video: VideoElement,
  profile: VideoProfile,
  title: String,
  autoPlay: Boolean,
  showControlsAtStart: Boolean,
  endSlatePath: String,
  overrideIsRatioHd: Option[Boolean] = None,
  embedPath: Option[String] = None
) {
  def poster = profile.bestFor(video.images).getOrElse(Static("images/media-holding.jpg").path)

  /** Width and height are always defined for video profile, so this is OK. */
  def width = profile.width.get
  def height = profile.width.get

  def showEndSlate = width >= Video640.width.get

  def isRatioHd = overrideIsRatioHd getOrElse profile.isRatioHD

  def blockVideoAds = video.videos.blockVideoAds
}
