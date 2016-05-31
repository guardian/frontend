package test

import com.gu.contentapi.client.model.v1.ItemResponse
import contentapi.ContentApiClient
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import org.scalatest.concurrent.{Futures, ScalaFutures}

@DoNotDiscover class ShareLinksTest extends FlatSpec with Matchers with ConfiguredTestSuite with Futures with ScalaFutures {

  private val edition = common.editions.Uk

  "ShareLink" should "provide valid page-level campaign-links in the correct order" in {
    val response = ContentApiClient.getResponse(
      ContentApiClient.item("politics/blog/live/2016/feb/03/eu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live", edition)
    )

    whenReady(response) { item: ItemResponse =>

      item.content.map { apiContent =>

        implicit val request = TestRequest()
        val pageShares = model.Content(apiContent).sharelinks.pageShares

        pageShares.map(_.text) should be (List("Facebook", "Twitter", "Email", "Pinterest", "LinkedIn", "Google plus", "WhatsApp", "Messenger"))
        pageShares.map(_.href) should be (List(
          "https://www.facebook.com/dialog/share?app_id=202314643182694&href=http%3A%2F%2Fgu.com%2Fp%2F4gc8j%2Fsfb&redirect_uri=http%3A%2F%2Fgu.com%2Fp%2F4gc8j%2Fsfb",
          "https://twitter.com/intent/tweet?text=Cameron%20statement%20to%20the%20Commons%20on%20the%20EU%20referendum%20-%20Politics%20live&url=http%3A%2F%2Fgu.com%2Fp%2F4gc8j%2Fstw",
          "mailto:?subject=Cameron%20statement%20to%20the%20Commons%20on%20the%20EU%20referendum%20-%20Politics%20live&body=http%3A%2F%2Fgu.com%2Fp%2F4gc8j%2Fsbl",
          "http://www.pinterest.com/pin/find/?url=http%3A%2F%2Fgu.com%2Fp%2F4gc8j",
          "http://www.linkedin.com/shareArticle?mini=true&title=Cameron+statement+to+the+Commons+on+the+EU+referendum+-+Politics+live&url=http%3A%2F%2Fgu.com%2Fp%2F4gc8j",
          "https://plus.google.com/share?url=http%3A%2F%2Fgu.com%2Fp%2F4gc8j%2Fsgp&amp;hl=en-GB&amp;wwc=1",
          "whatsapp://send?text=%22Cameron%20statement%20to%20the%20Commons%20on%20the%20EU%20referendum%20-%20Politics%20live%22%20http%3A%2F%2Fgu.com%2Fp%2F4gc8j%2Fswa",
          "fb-messenger://share?link=http%3A%2F%2Fgu.com%2Fp%2F4gc8j%2Fsme&app_id=180444840287"))
      }
    }
  }

  it should "provide valid block-level campaign-links in the correct order for galleries" in {
    val response = ContentApiClient.getResponse(
      ContentApiClient.item("environment/gallery/2014/oct/22/2014-wildlife-photographer-of-the-year", edition)
    )

    whenReady(response) { item: ItemResponse =>

      item.content.map { apiContent =>
        val gallery = model.Content(apiContent)
        val elementShares = gallery.sharelinks.elementShares("2", None)

        elementShares.map(_.text) should be(List("Facebook", "Twitter", "Pinterest"))
        elementShares.map(_.href) should be(List(
          "https://www.facebook.com/dialog/share?app_id=202314643182694&href=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fsfb%232&redirect_uri=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fsfb%232",
          "https://twitter.com/intent/tweet?text=2014%20Wildlife%20photographer%20of%20the%20Year&url=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fstw%232",
          "http://www.pinterest.com/pin/create/button/?description=2014+Wildlife+photographer+of+the+Year&url=http%3A%2F%2Fgu.com%2Fp%2F42jcb%232&media="
        ))
      }
    }
  }

  it should "provide valid block-level campaign-links in the correct order for liveblogs" in {
    val response = ContentApiClient.getResponse(
      ContentApiClient.item("politics/blog/live/2016/feb/03/eu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live", edition)
    )

    whenReady(response) { item: ItemResponse =>

      item.content.map { apiContent =>
        val liveblog = model.Content(apiContent)
        val elementShares = liveblog.sharelinks.elementShares("2", None)

        elementShares.map(_.text) should be (List("Facebook", "Twitter", "Google plus"))
        elementShares.map(_.href) should be (List(
          "https://www.facebook.com/dialog/share?app_id=202314643182694&href=https%3A%2F%2Fwww.theguardian.com%2Fpolitics%2Fblog%2Flive%2F2016%2Ffeb%2F03%2Feu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live%3Fpage%3Dwith%3A2%26CMP%3Dshare_btn_fb%232&redirect_uri=https%3A%2F%2Fwww.theguardian.com%2Fpolitics%2Fblog%2Flive%2F2016%2Ffeb%2F03%2Feu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live%3Fpage%3Dwith%3A2%26CMP%3Dshare_btn_fb%232",
          "https://twitter.com/intent/tweet?text=Cameron%20statement%20to%20the%20Commons%20on%20the%20EU%20referendum%20-%20Politics%20live&url=https%3A%2F%2Fwww.theguardian.com%2Fpolitics%2Fblog%2Flive%2F2016%2Ffeb%2F03%2Feu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live%3Fpage%3Dwith%3A2%26CMP%3Dshare_btn_tw%232",
          "https://plus.google.com/share?url=https%3A%2F%2Fwww.theguardian.com%2Fpolitics%2Fblog%2Flive%2F2016%2Ffeb%2F03%2Feu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live%3Fpage%3Dwith%3A2%26CMP%3Dshare_btn_gp%232&amp;hl=en-GB&amp;wwc=1"
        ))
      }
    }
  }
}
