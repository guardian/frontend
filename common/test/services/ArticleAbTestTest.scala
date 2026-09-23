package services

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class ArticleAbTestTest extends AnyFlatSpec with Matchers {

  "ArticleAbTestAgent" should "have no tests initially" in {
    val agent = new ArticleAbTestAgent()
    agent.tests should be(Nil)
  }

  it should "return None for variantFor when there are no tests" in {
    val agent = new ArticleAbTestAgent()
    agent.variantFor("music/2026/sep/16/some-article") should be(None)
  }

  it should "add a new test via upsert" in {
    val agent = new ArticleAbTestAgent()
    agent.upsert("path/a", "p/b1")
    agent.tests should be(List(ArticleAbTest("path/a", "p/b1")))
  }

  it should "return the variant for a matching article path" in {
    val agent = new ArticleAbTestAgent()
    agent.upsert("path/a", "p/b1")
    agent.variantFor("path/a") should be(Some("p/b1"))
  }

  it should "return None for variantFor when the article path does not match" in {
    val agent = new ArticleAbTestAgent()
    agent.upsert("path/a", "p/b1")
    agent.variantFor("path/other") should be(None)
  }

  it should "replace the variant when upserting an existing article path" in {
    val agent = new ArticleAbTestAgent()
    agent.upsert("path/a", "p/b1")
    agent.upsert("path/a", "p/b2")
    agent.tests should be(List(ArticleAbTest("path/a", "p/b2")))
  }

  it should "not duplicate entries when upserting the same article path multiple times" in {
    val agent = new ArticleAbTestAgent()
    agent.upsert("path/a", "p/b1")
    agent.upsert("path/b", "p/b2")
    agent.upsert("path/a", "p/b3")
    agent.tests.length should be(2)
    agent.variantFor("path/a") should be(Some("p/b3"))
    agent.variantFor("path/b") should be(Some("p/b2"))
  }

  it should "replace all tests when setAll is called" in {
    val agent = new ArticleAbTestAgent()
    agent.upsert("path/a", "p/b1")

    val newTests = List(ArticleAbTest("path/x", "p/y1"), ArticleAbTest("path/z", "p/y2"))
    agent.setAll(newTests)

    agent.tests should be(newTests)
    agent.variantFor("path/a") should be(None)
    agent.variantFor("path/x") should be(Some("p/y1"))
    agent.variantFor("path/z") should be(Some("p/y2"))
  }

  it should "clear all tests when setAll is called with an empty list" in {
    val agent = new ArticleAbTestAgent()
    agent.upsert("path/a", "p/b1")
    agent.setAll(Nil)
    agent.tests should be(Nil)
  }

  it should "remove a test matching the given article path" in {
    val agent = new ArticleAbTestAgent()
    agent.upsert("path/a", "p/b1")
    agent.upsert("path/b", "p/b2")

    agent.remove("path/a")

    agent.tests should be(List(ArticleAbTest("path/b", "p/b2")))
    agent.variantFor("path/a") should be(None)
  }

  it should "do nothing when removing a non-existent article path" in {
    val agent = new ArticleAbTestAgent()
    agent.upsert("path/a", "p/b1")

    agent.remove("path/does-not-exist")

    agent.tests should be(List(ArticleAbTest("path/a", "p/b1")))
  }
}
