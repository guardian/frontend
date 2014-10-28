package tools

import com.gu.facia.client.models.Trail
import com.gu.googleauth.UserIdentity
import frontsapi.model.Block
import org.scalatest.{DoNotDiscover, Matchers, FreeSpec}
import test.ConfiguredTestSuite

@DoNotDiscover class FaciaApiTest extends FreeSpec with Matchers with ConfiguredTestSuite {

  "update the published date only for a new article and retain existing article date" - {

    val (identity: UserIdentity, block: Block) = scenarioOneLiveAnotherDraft

    val newBlock = FaciaApi.preparePublishBlock(identity)(block).get

    "no draft articles" in {
      newBlock.draft should be(None)
    }

    "had the right number of live articles" in {
      withClue(s"actual contents were <${newBlock.live}>") {
        newBlock.live.size should be(2)
      }
    }
    "existing article should have the old date" in {
      newBlock.live.collect { case Trail("existingId", 0, _) => true } should have('length (1))
    }
    "new article should have an updated timestamp" in {
      newBlock.live.collect { case Trail("newId", t, _) if t != 0 => true } should have('length (1))
    }

  }

  "discard the drafts without changing live" - {

    val (identity: UserIdentity, block: Block) = scenarioOneLiveAnotherDraft

    val newBlock = FaciaApi.prepareDiscardBlock(identity)(block).get

    "no draft articles" in {
      newBlock.draft should be(None)
    }

    "had the right number of live articles" in {
      withClue(s"actual contents were <${newBlock.live}>") {
        newBlock.live.size should be(1)
      }
    }
    "existing article should have the old date" in {
      newBlock.live.collect { case Trail("existingId", 0, _) => true } should have('length (1))
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
