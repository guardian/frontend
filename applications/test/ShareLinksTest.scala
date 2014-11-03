package test

import com.gu.contentapi.client.model.ItemResponse
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import org.scalatest.concurrent.{Futures, ScalaFutures}

@DoNotDiscover class ShareLinksTest extends FlatSpec with Matchers with ConfiguredTestSuite with Futures with ScalaFutures {

  private val edition = common.editions.Uk

  "ShareLink" should "provide valid page-level campaign-links in the correct order" in {
    val response = conf.LiveContentApi.item("environment/gallery/2014/oct/22/2014-wildlife-photographer-of-the-year", edition).response

    whenReady(response) { item: ItemResponse =>

      item.content.map { apiContent =>
        val pageShares = model.Content(apiContent).pageShares

        pageShares.map(_.text) should be (List("Facebook", "Twitter", "Email", "Google plus", "WhatsApp"))
        pageShares.map(_.href) should be (List(
          "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fsfb&ref=responsive",
          "https://twitter.com/intent/tweet?text=2014+Wildlife+photographer+of+the+Year&url=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fstw",
          "mailto:?subject=2014%20Wildlife%20photographer%20of%20the%20Year&body=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fsbl",
          "https://plus.google.com/share?url=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fsgp&amp;hl=en-GB&amp;wwc=1",
          "whatsapp://send?text=%222014%20Wildlife%20photographer%20of%20the%20Year%22%20http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fswa"))
      }
    }
  }

  it should "provide valid block-level campaign-links in the correct order" in {
    val response = conf.LiveContentApi.item("environment/gallery/2014/oct/22/2014-wildlife-photographer-of-the-year", edition).response

    whenReady(response) { item: ItemResponse =>

      item.content.map { apiContent =>
        val gallery = model.Content(apiContent)
        val blockShares = gallery.blockLevelShares("2")
        val linkShare = gallery.blockLevelLink("2")

        linkShare.map(_.text).getOrElse("") should be ("Link")
        linkShare.map(_.href).getOrElse("") should be ("http://gu.com/p/42jcb/sbl#2")

        blockShares.map(_.text) should be (List("Facebook", "Twitter", "Google plus"))
        blockShares.map(_.href) should be (List(
          "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fsfb%232&ref=responsive",
          "https://twitter.com/intent/tweet?text=2014+Wildlife+photographer+of+the+Year&url=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fstw%232",
          "https://plus.google.com/share?url=http%3A%2F%2Fgu.com%2Fp%2F42jcb%2Fsgp%232&amp;hl=en-GB&amp;wwc=1"))
      }
    }
  }
}
