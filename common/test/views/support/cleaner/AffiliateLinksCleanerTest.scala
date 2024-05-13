package views.support.cleaner
import conf.Configuration
import org.joda.time.DateTime
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import views.support.AffiliateLinksCleaner._

class AffiliateLinksCleanerTest extends AnyFlatSpec with Matchers {

  "linkToSkimLink" should "correctly convert a link to a skimlink" in {
    val link = "https://www.piratendating.nl/"
    val pageUrl = "/guardian-pirates/soulmates"
    linkToSkimLink(link, pageUrl, "123") should equal(
      s"https://go.skimresources.com/?id=123&url=https%3A%2F%2Fwww.piratendating.nl%2F&sref=${Configuration.site.host}/guardian-pirates/soulmates",
    )
  }

  "shouldAddAffiliateLinks" should "correctly determine when to add affiliate links" in {
    val supportedSections = Set("film", "books", "fashion")
    val oldPublishedDate = Some(new DateTime(2020, 8, 13, 0, 0))
    val newPublishedDate = Some(new DateTime(2020, 8, 15, 0, 0))
    val deniedPageUrl = "/fashion/2024/feb/16/sunscreen-in-winter-yep-spf-moisturiser-is-essential-all-year-round"
    val validHtml = """<div class=\"content__article-body from-content-api js-article__body\" itemprop=\"articleBody\"\n data-test-id=\"article-review-body\" \n\n \n\n\n\n>\n <p><span class=\"drop-cap\"><span class=\"drop-cap__inner\">T</span></span>here are so many lipsticks to choose from now, which is fun but can be overwhelming. The longest-wearing formulation is liquid, which forms a sort of seal on the lips, but many people find them drying. The next best thing is a matt lipstick bullet, offering staying power without parched lips.</p>\n<p>Start with picking a colour you love. You told me your outfit and colourings: a cream dress suits bright red. If you’re new to red lipstick, I’d recommend a brown-ish red such as Charlotte Tilbury <a href=\"https://www.cultbeauty.co.uk/charlotte-tilbury-matte-revolution/13323147.html?affil=thggpsad&amp;amp;switchcurrency=GBP&amp;amp;shippingcountry=GB&amp;amp;variation=13323158&amp;amp;gad_source=1&amp;amp;gclid=Cj0KCQiAw6yuBhDrARIsACf94RW1go2lRZz-IU6LIlUC6NqWZEfPjdbXlxgM4WAvG_eu7iZ03L6iFAoaAgIaEALw_wcB&amp;amp;gclsrc=aw.ds\" data-link-name=\"in body link\" class=\"u-underline\">Matte Revolution in Walk of No Shame</a>. Or try something with a hint of orange, such as Chilli, a warm, brick red, or Lady Danger, a vivid coral, from Mac’s reformulated <a href=\"https://www.maccosmetics.co.uk/product/13854/123863/products/makeup/lips/lipstick/macximal-silky-matte-lipstick?gad_source=1&amp;amp;gclid=Cj0KCQiA84CvBhCaARIsAMkAvkLfrUsODrSO6I1MNBQUzYfb3N4s_EsUYYVo0SRsC46tdZTzROMwIZEaAtAxEALw_wcB&amp;amp;gclsrc=aw.ds\" data-link-name=\"in body link\" class=\"u-underline\">Macximal Silky Matte range</a>.</p>\n<p>A neutral shade similar to your own lip colour works for every outfit. <a href=\"https://www.sephora.co.uk/p/DIOR-Rouge-Dior-Lipstick-35g?curr=GBP&amp;amp;option=61504curr=GBP&amp;amp;gad_source=1&amp;amp;gclid=Cj0KCQiAw6yuBhDrARIsACf94RVewm4VSC6Clq1CctvYLroiCzOoLVwPtx1xqUZefCpdRK6DADDmQ9YaAhcvEALw_wcB&amp;amp;gclsrc=aw.ds\" data-link-name=\"in body link\" class=\"u-underline\">Dior Rouge Dior Couture Colour</a> range has incredible staying power, but for a creamier finish, its <a href=\"https://www.lookfantastic.com/makeup-revolution-irl-filter-finish-lip-creme-1.8ml-various-shades/13947237.html?affil=thggpsad&amp;amp;switchcurrency=GBP&amp;amp;shippingcountry=GB&amp;amp;variation=13947243&amp;amp;affil=thgppc&amp;amp;kwds=&amp;amp;thg_ppc_campaign=71700000117078542&amp;amp;adtype=pla&amp;amp;product_id=13947243&amp;amp;gclid=Cj0KCQiAw6yuBhDrARIsACf94RV9W_qH5nEKAQU_D-f_7hRIYbmmCYMRomyaDPpHdLc3_VQRqBl2-hEaApjJEALw_wcB&amp;amp;gclsrc=aw.ds\" data-link-name=\"in body link\" class=\"u-underline\">Make Up Revolution IRL Filter Finish Lip Crème </a>is in between a matt and a cream lipstick, and lasts well. Or try a pigmented balm that really lasts – <a href=\"https://www.cultbeauty.co.uk/kosas-wet-stick-moisturizing-shiny-sheer-lipstick-3.1g-various-shades/14877003.html?affil=thggpsad&amp;amp;switchcurrency=GBP&amp;amp;shippingcountry=GB&amp;amp;variation=14877015&amp;amp;gad_source=1&amp;amp;gclid=Cj0KCQiAw6yuBhDrARIsACf94RVK_Yrwf6PJA8iu8wOAHyk2IgcvHjNcv7tUWlnGE_LKVM5i9igvk4IaAqVEEALw_wcB&amp;amp;gclsrc=aw.ds\" data-link-name=\"in body link\" class=\"u-underline\">Kosas</a> and <a href=\"https://www.cultbeauty.co.uk/westman-atelier-squeaky-clean-liquid-lip-balm/13324065.html?affil=thggpsad&amp;amp;switchcurrency=GBP&amp;amp;shippingcountry=GB&amp;amp;variation=13324066&amp;amp;gad_source=1&amp;amp;gclid=Cj0KCQiAw6yuBhDrARIsACf94RXbp4_JlHUPYCRcRIbzMaIEe-P5OuDZmh07xuR3VTzsMAbr30ItNDAaAizLEALw_wcB&amp;amp;gclsrc=aw.ds\" data-link-name=\"in body link\" class=\"u-underline\">Westman Atelier</a> are my go-tos.</p>\n<p>Whatever colour or formulation you pick, always use a lipliner in a similar or slightly darker shade to line the lips and avoid any bleeding or feathering. But my biggest hack is to use the lipliner to also fill in your lips; this gives the lipstick something to “grip” on to and keeps it in place. Whatever you pick, if you like it, it’s perfect – whether it’s green, nude, red or sparkly purple.</p>\n<p><em>Got a beauty question for Anita? Email her at <a href=\"mailto:%20BeautyQandA@theguardian.com\" data-link-name=\"in body link\" class=\"u-underline\">BeautyQandA@theguardian.com</a></em></p>\n </div>"""

    shouldAddAffiliateLinks(
      switchedOn = false,
      "film",
      None,
      supportedSections,
      Set.empty,
      Set.empty,
      List.empty,
      oldPublishedDate,
      deniedPageUrl,
      "article",
      validHtml,
    ) should be(false)
    shouldAddAffiliateLinks(
      switchedOn = true,
      "film",
      None,
      supportedSections,
      Set.empty,
      Set.empty,
      List.empty,
      oldPublishedDate,
      deniedPageUrl,
      "article",
      validHtml,
    ) should be(true)
    shouldAddAffiliateLinks(
      switchedOn = true,
      "film",
      Some(false),
      supportedSections,
      Set.empty,
      Set.empty,
      List.empty,
      oldPublishedDate,
      deniedPageUrl,
      "article",
      validHtml,
    ) should be(false)
    shouldAddAffiliateLinks(
      switchedOn = true,
      "news",
      Some(true),
      supportedSections,
      Set.empty,
      Set.empty,
      List.empty,
      oldPublishedDate,
      deniedPageUrl,
      "article",
      validHtml,
    ) should be(true)
    shouldAddAffiliateLinks(
      switchedOn = true,
      "news",
      None,
      supportedSections,
      Set("bereavement"),
      Set.empty,
      List("bereavement"),
      oldPublishedDate,
      deniedPageUrl,
      "article",
      validHtml,
    ) should be(false)
    shouldAddAffiliateLinks(
      switchedOn = true,
      "news",
      None,
      supportedSections,
      Set("bereavement"),
      Set.empty,
      List("tech"),
      oldPublishedDate,
      deniedPageUrl,
      "article",
      validHtml,
    ) should be(false)
    shouldAddAffiliateLinks(
      switchedOn = true,
      "fashion",
      None,
      supportedSections,
      Set("bereavement"),
      Set.empty,
      List("tech"),
      oldPublishedDate,
      deniedPageUrl,
      "article",
      validHtml,
    ) should be(true)
    shouldAddAffiliateLinks(
      switchedOn = true,
      "fashion",
      Some(true),
      supportedSections,
      Set.empty,
      Set("bereavement"),
      List("bereavement"),
      oldPublishedDate,
      deniedPageUrl,
      "article",
      validHtml,
    ) should be(false)
    shouldAddAffiliateLinks(
      switchedOn = true,
      "fashion",
      Some(true),
      supportedSections,
      Set.empty,
      Set("bereavement"),
      List("tech"),
      oldPublishedDate,
      deniedPageUrl,
      "article",
      validHtml,
    ) should be(true)
    shouldAddAffiliateLinks(
      switchedOn = true,
      "film",
      None,
      supportedSections,
      Set.empty,
      Set.empty,
      List.empty,
      newPublishedDate,
      deniedPageUrl,
      "article",
      validHtml,
    ) should be(false)
    shouldAddAffiliateLinks(
      switchedOn = true,
      "film",
      None,
      supportedSections,
      Set.empty,
      Set.empty,
      List.empty,
      newPublishedDate,
      deniedPageUrl,
      "gallery",
    ) should be(true)
  }
}
