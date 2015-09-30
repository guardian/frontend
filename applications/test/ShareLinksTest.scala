package test

import com.gu.contentapi.client.model.ItemResponse
import conf.LiveContentApi.getResponse
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import org.scalatest.concurrent.{Futures, ScalaFutures}

@DoNotDiscover class ShareLinksTest extends FlatSpec with Matchers with ConfiguredTestSuite with Futures with ScalaFutures {

  private val edition = common.editions.Uk

  "ShareLink" should "provide valid page-level campaign-links in the correct order" in {
    val response = getResponse(
      conf.LiveContentApi.item("environment/gallery/2014/oct/22/2014-wildlife-photographer-of-the-year", edition)
    )

    whenReady(response) { item: ItemResponse =>

      item.content.map { apiContent =>
        val pageShares = model.Content(apiContent).pageShares

        pageShares.map(_.text) should be (List("Facebook", "Twitter", "Email", "Pinterest", "Google plus", "WhatsApp"))
        pageShares.map(_.href) should be (List(
          "https://www.facebook.com/dialog/share?app_id=202314643182694&href=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fsfb&redirect_uri=http%3A%2F%2Fgu.com%2Fp%2F42jcb",
          "https://twitter.com/intent/tweet?text=2014%20Wildlife%20photographer%20of%20the%20Year&url=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fstw",
          "mailto:?subject=2014%20Wildlife%20photographer%20of%20the%20Year&body=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fsbl",
          "http://www.pinterest.com/pin/find/?url=http%3A%2F%2Fwww.theguardian.com%2Fenvironment%2Fgallery%2F2014%2Foct%2F22%2F2014-wildlife-photographer-of-the-year",
          "https://plus.google.com/share?url=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fsgp&amp;hl=en-GB&amp;wwc=1",
          "whatsapp://send?text=%222014%20Wildlife%20photographer%20of%20the%20Year%22%20http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fswa"))
      }
    }
  }

  it should "provide valid block-level campaign-links in the correct order" in {
    val response = getResponse(
      conf.LiveContentApi.item("environment/gallery/2014/oct/22/2014-wildlife-photographer-of-the-year", edition)
    )

    whenReady(response) { item: ItemResponse =>

      item.content.map { apiContent =>
        val gallery = model.Content(apiContent)
        val elementShares = gallery.elementShares(Some("2"))

        elementShares.map(_.text) should be (List("Facebook", "Twitter", "Pinterest"))
        elementShares.map(_.href) should be (List(
          "https://www.facebook.com/dialog/share?app_id=202314643182694&href=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fsfb%232&redirect_uri=http%3A%2F%2Fgu.com%2Fp%2F42jcb",
          "https://twitter.com/intent/tweet?text=2014%20Wildlife%20photographer%20of%20the%20Year&url=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fstw%232",
          "http://www.pinterest.com/pin/create/button/?description=2014+Wildlife+photographer+of+the+Year&url=http%3A%2F%2Fwww.theguardian.com%2Fenvironment%2Fgallery%2F2014%2Foct%2F22%2F2014-wildlife-photographer-of-the-year&media="))
      }
    }
  }
}
