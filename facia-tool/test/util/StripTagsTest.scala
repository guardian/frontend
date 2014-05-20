package util

import frontsapi.model.{Front, Config}
import org.scalatest.{FlatSpec, Matchers}

class StripTagsTest extends FlatSpec with Matchers {

  def createConfigWithFront(
    section: Option[String] = None,
    title: Option[String] = None,
    webTitle: Option[String] = None,
    description: Option[String] = None): Config =
    Config(Map("uk" -> Front(Nil, section, webTitle, title, description, None)), Map.empty)

  "StripTags" should "strip tag from title" in {
    val config = createConfigWithFront(title = Option("<strip><me>"))
    config.fronts.head._2.title.get should be ("")
  }

  it should "strip tag from webTitle" in {
    val config = createConfigWithFront(webTitle = Option("<strip><me>"))
    config.fronts.head._2.webTitle.get should be ("")
  }

  it should "strip tag from description" in {
    val config = createConfigWithFront(description = Option("<strip><me>"))
    config.fronts.head._2.description.get should be ("")
  }

  it should "strip tag from section" in {
    val config = createConfigWithFront(section = Option("<strip><me>"))
    config.fronts.head._2.section.get should be ("")
  }
}
