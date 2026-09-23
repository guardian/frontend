package services
import common.{Box, GuLogging}

/*
* a is the CAPI ID of article A (eg "music/2026/sep/16/orville-peck-interview-new-album-mule" )
* b is the short path of article B (eg "p/x5zkef")
* */
case class ArticleAbTest(a: String, b: String)

class ArticleAbTestAgent() extends GuLogging {
  private val testsBox = Box[List[ArticleAbTest]](Nil)

  def tests: List[ArticleAbTest] = testsBox.get()

  def variantFor(articleAPath: String): Option[String] =
    testsBox.get().find(_.a == articleAPath).map(_.b)

  def upsert(articleAPath: String, articleBPath: String): Unit =
    testsBox.alter { existing =>
      ArticleAbTest(articleAPath, articleBPath) :: existing.filterNot(_.a == articleAPath)
    }

  def setAll(newTests: List[ArticleAbTest]): Unit =
    testsBox.alter(newTests)

  def remove(articleAPath: String): Unit =
    testsBox.alter(_.filterNot(_.a == articleAPath))

}
