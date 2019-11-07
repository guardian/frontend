package frontpress

import org.scalatest.{FlatSpec, Matchers}

class FapiFrontPressTest extends FlatSpec with Matchers {
  "CapiUrl" should "return the CAPI ID from a CAPI URL" in {
    val capiUrl = s"https://content.guardianapis.com/atom/interactive/interactives/2019/10/test-snap?api-key=example"

    val capiId = CapiUrl.extractId(capiUrl)

    capiId shouldBe "atom/interactive/interactives/2019/10/test-snap"
  }
}
