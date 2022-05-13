package commercial.model.capi

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.BeforeAndAfterAll
import test._

class CapiAgentTest
    extends AnyFlatSpec
    with Matchers
    with SingleServerSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestContentApiClient {

  lazy val capiAgent = new CapiAgent(testContentApiClient)

  "idsFromShortUrls" should "give ID of a valid short URL" in {
    capiAgent.idsFromShortUrls(Seq("p/43b2q")) shouldBe Seq("p/43b2q")
  }

  it should "give ID of a valid short URL with campaign suffix" in {
    capiAgent.idsFromShortUrls(Seq("p/4dy39/stw")) shouldBe Seq("p/4dy39")
  }

  it should "give ID of a valid short URL with leading slash" in {
    capiAgent.idsFromShortUrls(Seq("/p/4dy39")) shouldBe Seq("p/4dy39")
  }

  it should "give ID of a valid short URL with leading slash and campaign suffix" in {
    capiAgent.idsFromShortUrls(Seq("/p/4dy39/stw")) shouldBe Seq("p/4dy39")
  }
}
