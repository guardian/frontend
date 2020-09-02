package views.support.cleaner

import java.net.URLDecoder

import org.jsoup.nodes.{Document, Element}

// There are two element types that have been found to contain Soundcloud embeds.
// These are: element-audio and element-embed
object SoundcloudHelper {
  def createElementFromTrack(document: Document, trackId: String): Element = {
    val soundcloud = document.createElement("amp-soundcloud")
    soundcloud.attr("data-trackid", trackId)
    soundcloud.attr("data-visual", "true")
    soundcloud.attr("height", "300") // height is necessary if data-visual == true
  }

  def createElementFromPlaylist(document: Document, playlistId: String): Element = {
    val soundcloud = document.createElement("amp-soundcloud")
    soundcloud.attr("data-playlistid", playlistId)
    soundcloud.attr("data-visual", "true")
    soundcloud.attr("height", "300") // height is necessary if data-visual == true
  }

  def getTrackIdFromUrl(soundcloudUrl: String): Option[String] = {
    val pattern = ".*api.soundcloud.com/tracks/(\\d+).*".r
    URLDecoder.decode(soundcloudUrl, "UTF-8") match {
      case pattern(trackId) => {
        Some(trackId)
      }
      case _ => None
    }
  }

  def getPlaylistIdFromUrl(soundcloudUrl: String): Option[String] = {
    val pattern = ".*api.soundcloud.com/playlists/(\\d+).*".r
    URLDecoder.decode(soundcloudUrl, "UTF-8") match {
      case pattern(playlistId) => {
        Some(playlistId)
      }
      case _ => None
    }
  }

  def getSoundCloudElement(document: Document, iframeElement: Element): Option[Element] = {
    val trackId = SoundcloudHelper.getTrackIdFromUrl(iframeElement.attr("src"))
    val playlistId = SoundcloudHelper.getPlaylistIdFromUrl(iframeElement.attr("src"))

    (trackId, playlistId) match {
      case (Some(id), _) => Some(SoundcloudHelper.createElementFromTrack(document, id))
      case (_, Some(id)) => Some(SoundcloudHelper.createElementFromPlaylist(document, id))
      case _             => None
    }
  }

}
