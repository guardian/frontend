package test

import com.gu.contentapi.client.model.v1.ItemResponse
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.concurrent.{Futures, ScalaFutures}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

@DoNotDiscover class ShareLinksTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with Futures
    with ScalaFutures
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestContentApiClient {

  private val edition = common.editions.Uk

  "ShareLink" should "provide valid page-level campaign-links in the correct order" in {
    val response = testContentApiClient.getResponse(
      testContentApiClient.item(
        "politics/blog/live/2016/feb/03/eu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live",
        edition,
      ),
    )

    whenReady(response) { item: ItemResponse =>
      item.content.map { apiContent =>
        implicit val request = TestRequest()
        val pageShares = model.Content(apiContent).sharelinks.pageShares

        pageShares.visible.map(_.text) should be(List("Facebook", "Twitter", "Email"))
        pageShares.hidden.map(_.text) should be(List("LinkedIn", "WhatsApp", "Messenger"))
        pageShares.visible.map(_.href) should be(
          List(
            "https://www.facebook.com/dialog/share?app_id=202314643182694&href=https%3A%2F%2Fwww.theguardian.com%2Fpolitics%2Fblog%2Flive%2F2016%2Ffeb%2F03%2Feu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live%3FCMP%3Dshare_btn_fb",
            "https://twitter.com/intent/tweet?text=Cameron%20statement%20to%20the%20Commons%20on%20the%20EU%20referendum%20-%20Politics%20live&url=https%3A%2F%2Fwww.theguardian.com%2Fpolitics%2Fblog%2Flive%2F2016%2Ffeb%2F03%2Feu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live%3FCMP%3Dshare_btn_tw",
            "mailto:?subject=Cameron%20statement%20to%20the%20Commons%20on%20the%20EU%20referendum%20-%20Politics%20live&body=https%3A%2F%2Fwww.theguardian.com%2Fpolitics%2Fblog%2Flive%2F2016%2Ffeb%2F03%2Feu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live%3FCMP%3Dshare_btn_link",
          ),
        )
        pageShares.hidden.map(_.href) should be(
          List(
            "http://www.linkedin.com/shareArticle?mini=true&title=Cameron%20statement%20to%20the%20Commons%20on%20the%20EU%20referendum%20-%20Politics%20live&url=https%3A%2F%2Fwww.theguardian.com%2Fpolitics%2Fblog%2Flive%2F2016%2Ffeb%2F03%2Feu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live",
            "whatsapp://send?text=%22Cameron%20statement%20to%20the%20Commons%20on%20the%20EU%20referendum%20-%20Politics%20live%22%20https%3A%2F%2Fwww.theguardian.com%2Fpolitics%2Fblog%2Flive%2F2016%2Ffeb%2F03%2Feu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live%3FCMP%3Dshare_btn_wa",
            "fb-messenger://share?link=https%3A%2F%2Fwww.theguardian.com%2Fpolitics%2Fblog%2Flive%2F2016%2Ffeb%2F03%2Feu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live%3FCMP%3Dshare_btn_me&app_id=180444840287",
          ),
        )
      }
    }
  }

  it should "provide valid block-level campaign-links in the correct order for galleries" in {
    val response = testContentApiClient.getResponse(
      testContentApiClient.item("environment/gallery/2014/oct/22/2014-wildlife-photographer-of-the-year", edition),
    )

    whenReady(response) { item: ItemResponse =>
      item.content.map { apiContent =>
        val gallery = model.Content(apiContent)
        val elementShares = gallery.sharelinks.elementShares("2", None)

        elementShares.map(_.text) should be(List("Facebook", "Twitter"))
        elementShares.map(_.href) should be(
          List(
            "https://www.facebook.com/dialog/share?app_id=202314643182694&href=https%3A%2F%2Fwww.theguardian.com%2Fenvironment%2Fgallery%2F2014%2Foct%2F22%2F2014-wildlife-photographer-of-the-year%3FCMP%3Dshare_btn_fb%26page%3Dwith%3A2%232",
            "https://twitter.com/intent/tweet?text=2014%20Wildlife%20photographer%20of%20the%20Year&url=https%3A%2F%2Fwww.theguardian.com%2Fenvironment%2Fgallery%2F2014%2Foct%2F22%2F2014-wildlife-photographer-of-the-year%3FCMP%3Dshare_btn_tw%26page%3Dwith%3A2%232",
          ),
        )
      }
    }
  }

  it should "provide valid block-level campaign-links in the correct order for liveblogs" in {
    val response = testContentApiClient.getResponse(
      testContentApiClient.item(
        "politics/blog/live/2016/feb/03/eu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live",
        edition,
      ),
    )

    whenReady(response) { item: ItemResponse =>
      item.content.map { apiContent =>
        val liveblog = model.Content(apiContent)
        val elementShares = liveblog.sharelinks.elementShares("2", None)

        elementShares.map(_.text) should be(List("Facebook", "Twitter"))
        elementShares.map(_.href) should be(
          List(
            "https://www.facebook.com/dialog/share?app_id=202314643182694&href=https%3A%2F%2Fwww.theguardian.com%2Fpolitics%2Fblog%2Flive%2F2016%2Ffeb%2F03%2Feu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live%3FCMP%3Dshare_btn_fb%26page%3Dwith%3A2%232",
            "https://twitter.com/intent/tweet?text=Cameron%20statement%20to%20the%20Commons%20on%20the%20EU%20referendum%20-%20Politics%20live&url=https%3A%2F%2Fwww.theguardian.com%2Fpolitics%2Fblog%2Flive%2F2016%2Ffeb%2F03%2Feu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live%3FCMP%3Dshare_btn_tw%26page%3Dwith%3A2%232",
          ),
        )
      }
    }
  }
}
