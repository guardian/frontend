package model

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class TopMentionsModelTest extends AnyFlatSpec with Matchers {
  "getFilterEntityFromTopicsParam" should "return none when no topic is provided" in {
    val result = TopMentionsTopic.fromString(None)

    result should be(None)
  }

  it should "return none when an invalid string is provided" in {
    val topic = Some("random string")
    val result = TopMentionsTopic.fromString(topic)

    result should be(None)
  }

  it should "return none when the provided topic does not exist as a valid TopMentionsTopicType" in {
    val topic = Some("organization:nhs")
    val result = TopMentionsTopic.fromString(topic)

    result should be(None)
  }

  it should "be case insensitive on topic type" in {
    val topics = Seq(
      TestCase("ORG:someEntityValue", TopMentionsTopic(TopMentionsTopicType.Org, "someEntityValue")),
      TestCase("Org:someEntityValue", TopMentionsTopic(TopMentionsTopicType.Org, "someEntityValue")),
      TestCase("Product:someEntityValue", TopMentionsTopic(TopMentionsTopicType.Product, "someEntityValue")),
      TestCase("PRODUCT:someEntityValue", TopMentionsTopic(TopMentionsTopicType.Product, "someEntityValue")),
      TestCase("person:someEntityValue", TopMentionsTopic(TopMentionsTopicType.Person, "someEntityValue")),
    )
    topics foreach { topic =>
      val result = TopMentionsTopic.fromString(Some(topic.topic))
      result should be(Some(topic.result))
    }
  }
}

case class TestCase(val topic: String, val result: TopMentionsTopic)
