package services

import model.dotcomrendering.pageElements.AffiliateProductPrice

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class AffiliateProductPriceCacheTest extends AnyFlatSpec with Matchers {

  "csvToMap" should "convert URL and price rows into a map" in {
    val csv =
      """https://example.com/product-a,£,19.99
        |https://example.com/product-b,$,42.50""".stripMargin

    AffiliateProductPriceCache.csvToMap(csv) shouldBe Map(
      "https://example.com/product-a" -> AffiliateProductPrice("£", "19.99"),
      "https://example.com/product-b" -> AffiliateProductPrice("$", "42.50"),
    )
  }

  it should "trim whitespace and ignore blank lines" in {
    val csv =
      """  https://example.com/product-a , £ , 19.99
        |
        | https://example.com/product-b,$,42.50 """.stripMargin

    AffiliateProductPriceCache.csvToMap(csv) shouldBe Map(
      "https://example.com/product-a" -> AffiliateProductPrice("£", "19.99"),
      "https://example.com/product-b" -> AffiliateProductPrice("$", "42.50"),
    )
  }
}
