package views.fragments.atoms

import model.content.MediaAssetPlatform.Youtube
import model.content.MediaAssetType.Video
import model.content.{MediaAsset, MediaAtom}
import org.scalatestplus.play.MixedPlaySpec
import play.api.test.FakeRequest
import play.api.test.Helpers._

class YoutubeSpec extends MixedPlaySpec {

  "Youtube atom view" should {
    "contain player placeholder div" in new App {
      val mediaAtom = MediaAtom(
        id = "atomId",
        defaultHtml = "",
        assets = Seq(
          MediaAsset(
            id = "assetId",
            version = 0,
            platform = Youtube,
            mimeType = None,
            assetType = Video,
            dimensions = None,
            aspectRatio = None,
          ),
        ),
        title = "",
        duration = None,
        source = None,
        posterImage = None,
        expired = None,
        activeVersion = None,
        channelId = None,
        trailImage = None,
        videoPlayerFormat = None,
      )
      val displayCaption = false
      val view = views.html.fragments.atoms
        .youtube(mediaAtom, displayCaption)(FakeRequest())
      val contentString = contentAsString(view)
      contentString must include(
        """<div id="youtube-assetId-""",
      )
      contentString must include(
        """ data-asset-id="assetId" class="youtube-media-atom__iframe"></div>""",
      )
    }
  }
}
