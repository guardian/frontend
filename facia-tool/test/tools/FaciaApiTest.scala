package tools

import com.gu.facia.client.models.Trail
import com.gu.googleauth.UserIdentity
import frontsapi.model.Block
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import test.ConfiguredTestSuite

@DoNotDiscover class FaciaApiTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  it should "update the published date only for a new article and retain existing article date" in {

    val (identity: UserIdentity, block: Block) = scenarioOneLiveAnotherDraft

    val newBlock = FaciaApi.preparePublishBlock(identity)(block).get

    newBlock.draft should be(None)

    withClue(s"live blocks were wrong, actual <${newBlock.live}>") {
      val liveById = newBlock.live.groupBy(_.id)
      liveById.getOrElse("existingId", Nil).count { case Trail(_, 0, None) => true} should be(1)
      liveById.getOrElse("newId", Nil).count { case Trail(_, t, None) if t != 0 => true} should be(1)
      liveById.size should be(2)
    }

  }

  it should "discard the drafts without changing live" in {

    val (identity: UserIdentity, block: Block) = scenarioOneLiveAnotherDraft

    val newBlock = FaciaApi.prepareDiscardBlock(identity)(block).get

    newBlock.draft should be(None)

    withClue(s"live blocks were wrong, actual <${newBlock.live}>") {
      val liveById = newBlock.live.groupBy(_.id)
      liveById.getOrElse("existingId", Nil).count { case Trail(_, 0, None) => true} should be(1)
      liveById.size should be(1)
    }

  }

  private def scenarioOneLiveAnotherDraft: (UserIdentity, Block) = {
    val identity = UserIdentity("", "email@email.com", "John", "Duffell", 0, None)
    val live = List(Trail("existingId", 0, None))
    val draft = Trail("newId", 0, None) :: live
    val block = Block(None, live, Some(draft), "oldLastUpdated", "oldUpdatedBy", "oldUpdatedEmail", None, None, None, None)
    (identity, block)
  }
}
