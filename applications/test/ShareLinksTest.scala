package test

import com.gu.contentapi.client.model.ItemResponse
import conf.LiveContentApi.getResponse
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import org.scalatest.concurrent.{Futures, ScalaFutures}

@DoNotDiscover class ShareLinksTest extends FlatSpec with Matchers with ConfiguredTestSuite with Futures with ScalaFutures {

  private val edition = common.editions.Uk

  "ShareLink" should "provide valid page-level campaign-links in the correct order" in {
    val response = getResponse(
      conf.LiveContentApi.item("politics/blog/live/2016/feb/03/eu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live", edition)
    )

    whenReady(response) { item: ItemResponse =>

      item.content.map { apiContent =>
        val pageShares = model.Content(apiContent).sharelinks.pageShares

        pageShares.map(_.text) should be (List("Facebook", "Twitter", "Email", "Pinterest", "LinkedIn", "Google plus", "WhatsApp"))
        pageShares.map(_.href) should be (List(
          "https://www.facebook.com/dialog/share?app_id=202314643182694&href=http%3A%2F%2Fgu.com%2Fp%2F4gc8j%2Fsfb&redirect_uri=http%3A%2F%2Fgu.com%2Fp%2F4gc8j",
          "https://twitter.com/intent/tweet?text=Obama%20reaffirms%20his%20support%20for%20Britain%20remaining%20in%20EU%20-%20Politics%20live&url=http%3A%2F%2Fgu.com%2Fp%2F4gc8j%2Fstw",
          "mailto:?subject=Obama%20reaffirms%20his%20support%20for%20Britain%20remaining%20in%20EU%20-%20Politics%20live&body=http%3A%2F%2Fgu.com%2Fp%2F4gc8j%2Fsbl",
          "http://www.pinterest.com/pin/find/?url=http%3A%2F%2Fgu.com%2Fp%2F4gc8j",
          "http://www.linkedin.com/shareArticle?mini=true&title=Obama+reaffirms+his+support+for+Britain+remaining+in+EU+-+Politics+live&url=http%3A%2F%2Fgu.com%2Fp%2F4gc8j",
          "https://plus.google.com/share?url=http%3A%2F%2Fgu.com%2Fp%2F4gc8j%2Fsgp&amp;hl=en-GB&amp;wwc=1",
          "whatsapp://send?text=%22Obama%20reaffirms%20his%20support%20for%20Britain%20remaining%20in%20EU%20-%20Politics%20live%22%20http%3A%2F%2Fgu.com%2Fp%2F4gc8j%2Fswa"
        ))
      }
    }
  }

  it should "provide valid block-level campaign-links in the correct order for galleries" in {
    val response = getResponse(
      conf.LiveContentApi.item("environment/gallery/2014/oct/22/2014-wildlife-photographer-of-the-year", edition)
    )

    whenReady(response) { item: ItemResponse =>

      item.content.map { apiContent =>
        val gallery = model.Content(apiContent)
        val elementShares = gallery.sharelinks.elementShares(Some("2"))

        elementShares.map(_.text) should be(List("Facebook", "Twitter", "Pinterest"))
        elementShares.map(_.href) should be(List(
          "https://www.facebook.com/dialog/share?app_id=202314643182694&href=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fsfb%232&redirect_uri=http%3A%2F%2Fgu.com%2Fp%2F42jcb",
          "https://twitter.com/intent/tweet?text=2014%20Wildlife%20photographer%20of%20the%20Year&url=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fstw%232",
          "http://www.pinterest.com/pin/create/button/?description=2014+Wildlife+photographer+of+the+Year&url=http%3A%2F%2Fgu.com%2Fp%2F42jcb%232&media="
        ))
      }
    }
  }

  it should "provide valid block-level campaign-links in the correct order for liveblogs" in {
    val response = getResponse(
      conf.LiveContentApi.item("politics/blog/live/2016/feb/03/eu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live", edition)
    )

    whenReady(response) { item: ItemResponse =>

      item.content.map { apiContent =>
        val liveblog = model.Content(apiContent)
        val elementShares = liveblog.sharelinks.elementShares(Some("2"))

        elementShares.map(_.text) should be (List("Facebook", "Twitter", "Google plus"))
        elementShares.map(_.href) should be (List(
          "https://www.facebook.com/dialog/share?app_id=202314643182694&href=http%3A%2F%2Fwww.theguardian.com%2Fpolitics%2Fblog%2Flive%2F2016%2Ffeb%2F03%2Feu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live%3Fpage%3Dwith%3A2%26CMP%3Dshare_btn_fb%232&redirect_uri=http%3A%2F%2Fgu.com%2Fp%2F4gc8j",
          "https://twitter.com/intent/tweet?text=Obama%20reaffirms%20his%20support%20for%20Britain%20remaining%20in%20EU%20-%20Politics%20live&url=http%3A%2F%2Fwww.theguardian.com%2Fpolitics%2Fblog%2Flive%2F2016%2Ffeb%2F03%2Feu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live%3Fpage%3Dwith%3A2%26CMP%3Dshare_btn_tw%232",
          "https://plus.google.com/share?url=http%3A%2F%2Fwww.theguardian.com%2Fpolitics%2Fblog%2Flive%2F2016%2Ffeb%2F03%2Feu-renegotiation-pmqs-cameron-corbyn-he-prepares-to-make-statement-to-mps-politics-live%3Fpage%3Dwith%3A2%26CMP%3Dshare_btn_gp%232&amp;hl=en-GB&amp;wwc=1"
        ))
      }
    }
  }
}
