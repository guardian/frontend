package services

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import test.ConfiguredTestSuite

class RelatedTest extends FlatSpec with Matchers with Related {

  it should "manage one article" in {

    val content = List(
      TagsArticle(List("k1"), 1)
    )
    val keywordIds = List("k1")

    val result = getFirstTwoEachTag(content, keywordIds, List(1))

    result should be((List(1), List()))
  }

  it should "not take when it's run out" in {

    val content = List(
      TagsArticle(List("k1"), 1)
    )
    val keywordIds = List("k1")

    val result = getFirstTwoEachTag(content, keywordIds, List(0))

    result should be((List(), List(1)))
  }


  it should "manage two articles" in {

    val content = List(
      TagsArticle(List("k1"), 1),
      TagsArticle(List("k1"), 2)
    )
    val keywordIds = List("k1")

    val result = getFirstTwoEachTag(content, keywordIds, List(2))

    result should be((List(1, 2), List()))
  }

  it should "manage two articles with overflow" in {

    val content = List(
      TagsArticle(List("k1"), 1),
      TagsArticle(List("k1"), 2)
    )
    val keywordIds = List("k1")

    val result = getFirstTwoEachTag(content, keywordIds, List(1))

    result should be((List(1), List(2)))
  }

  it should "also use a second tag" in {

    val content = List(
      TagsArticle(List("k1"), 1),
      TagsArticle(List("k2"), 2)
    )
    val keywordIds = List("k1", "k2")

    val result = getFirstTwoEachTag(content, keywordIds, List(0, 1))

    result should be((List(2), List(1)))
  }

  it should "ignore unknown tags" in {

    val content = List(
      TagsArticle(List("a", "k1"), 1),
      TagsArticle(List("a", "k2"), 2)
    )
    val keywordIds = List("k1", "k2")

    val result = getFirstTwoEachTag(content, keywordIds, List(0, 1))

    result should be((List(2), List(1)))
  }


  it should "manage a full compliment of articles" in {

    val content = List(
      TagsArticle(List("k1", "a"), 1),
      TagsArticle(List("k2", "a"), 2),
      TagsArticle(List("k3", "a"), 3),
      TagsArticle(List("k1", "a"), 4),
      TagsArticle(List("k1", "a"), 5),
      TagsArticle(List("k1", "a"), 6),
      TagsArticle(List("k1", "a"), 7),
      TagsArticle(List("k1", "a"), 8),
      TagsArticle(List("k3", "a"), 9),
      TagsArticle(List("k2", "a"), 10),
      TagsArticle(List("k3", "a"), 11)
    )
    val keywordIds = List("k1", "k2", "k3")

    val result = getFirstTwoEachTag(content, keywordIds, List(2, 2, 2))

    result should be((List(1, 2, 3, 4, 9, 10), List(5, 6, 7, 8, 11)))
  }

  it should "not filter a tag" in {
    tagsOnly(List("a/b")) should be(List("a/b"))
  }

  it should "filter a section" in {
    tagsOnly(List("a/a")) should be(List())
  }

}
