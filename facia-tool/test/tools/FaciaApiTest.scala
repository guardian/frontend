package tools

import com.gu.facia.client.models.Trail
import com.gu.googleauth.UserIdentity
import frontsapi.model.Block
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import test.ConfiguredTestSuite

@DoNotDiscover class FaciaApiTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  it should "update the published date only for a new article and retain existing article date" in {
    val identity = UserIdentity("","email@email.com","John","Duffell",0, None)
    val live = List(Trail("existingId",0, None))
    val draft = Trail("newId",0,None) :: live
    val block = Block(None,live, Some(draft),"oldLastUpdated","oldUpdatedBy","oldUpdatedEmail", None, None, None, None)
    val newBlock = FaciaApi.preparePublishBlock(identity)(block).get
    newBlock.draft should be(None)
    newBlock.live.length should be(2)
    newBlock.live(0).id should not be(newBlock.live(1).id)
    val unexpected = newBlock.live.filter {
      case Trail("existingId",0, None) => false
      case Trail("newId",t, None) if t != 0 => false
      case invalid => true
    }
    withClue("some articles didn't have the right dates") {
      unexpected shouldBe empty
    }
  }

}
