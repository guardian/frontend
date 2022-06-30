package model

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class TopicsModelTest extends AnyFlatSpec with Matchers {
  "getFilterEntityFromTopicsParam" should "return none when no topic is provided" in {
    val result = SelectedTopic.fromString(None)

    result should be(None)
  }

  it should "return none when an invalid string is provided" in {
    val topic = Some("random string")
    val result = SelectedTopic.fromString(topic)

    result should be(None)
  }

  it should "return none when the provided topic does not exist as a valid TopicType" in {
    val topic = Some("organization:nhs")
    val result = SelectedTopic.fromString(topic)

    result should be(None)
  }

  it should "be case insensitive on topic type" in {
    val topics = Seq(
      TestCase("ORG:someEntityValue", SelectedTopic(TopicType.Org, "someEntityValue")),
      TestCase("Org:someEntityValue", SelectedTopic(TopicType.Org, "someEntityValue")),
      TestCase("Product:someEntityValue", SelectedTopic(TopicType.Product, "someEntityValue")),
      TestCase("PRODUCT:someEntityValue", SelectedTopic(TopicType.Product, "someEntityValue")),
      TestCase("person:someEntityValue", SelectedTopic(TopicType.Person, "someEntityValue")),
    )
    topics foreach { topic =>
      val result = SelectedTopic.fromString(Some(topic.topic))
      result should be(Some(topic.result))
    }
  }
}

case class TestCase(val topic: String, val result: SelectedTopic)
