package tools

import com.gu.facia.client.models.{CollectionJson, Trail}
import com.gu.pandomainauth.model.User
import org.joda.time.DateTime
import org.scalatest.{DoNotDiscover, FreeSpec, Matchers}
import test.ConfiguredTestSuite

@DoNotDiscover class FaciaApiTest extends FreeSpec with Matchers with ConfiguredTestSuite {

  "update the published date only for a new article and retain existing article date" - {

    val (identity: User, collectionJson: CollectionJson) = scenarioOneLiveAnotherDraft

    val newCollectionJson = FaciaApi.preparePublishCollectionJson(identity)(collectionJson).get

    "no draft articles" in {
      newCollectionJson.draft should be(None)
    }

    "had the right number of live articles" in {
      withClue(s"actual contents were <${newCollectionJson.live}>") {
        newCollectionJson.live.size should be(2)
      }
    }
    "existing article should have the old date" in {
      newCollectionJson.live.collect { case Trail("existingId", 0, _) => true } should have('length (1))
    }
    "new article should have an updated timestamp" in {
      newCollectionJson.live.collect { case Trail("newId", t, _) if t != 0 => true } should have('length (1))
    }

  }

  "discard the drafts without changing live" - {

    val (identity: User, collectionJson: CollectionJson) = scenarioOneLiveAnotherDraft

    val newCollectionJson = FaciaApi.prepareDiscardCollectionJson(identity)(collectionJson).get

    "no draft articles" in {
      newCollectionJson.draft should be(None)
    }

    "had the right number of live articles" in {
      withClue(s"actual contents were <${newCollectionJson.live}>") {
        newCollectionJson.live.size should be(1)
      }
    }
    "existing article should have the old date" in {
      newCollectionJson.live.collect { case Trail("existingId", 0, _) => true } should have('length (1))
    }

  }

  private def scenarioOneLiveAnotherDraft: (User, CollectionJson) = {
    val identity = User("John", "Duffell", "email@email.com", None)
    val live = List(Trail("existingId", 0, None))
    val draft = Trail("newId", 0, None) :: live
    val collectionJson = CollectionJson(live, Some(draft), None, new DateTime(0), "oldUpdatedBy", "oldUpdatedEmail", None, None, None)
    (identity, collectionJson)
  }
}
