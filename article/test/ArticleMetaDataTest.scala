package test

import metadata.MetaDataMatcher
import org.jsoup.Jsoup
import play.api.libs.json._
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._

@DoNotDiscover class ArticleMetaDataTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  val articleUrl = "environment/2012/feb/22/capitalise-low-carbon-future"

  it should "Include organisation metadata" in {
    val result = controllers.ArticleController.renderArticle(articleUrl, None, None)(TestRequest(articleUrl))
    MetaDataMatcher.ensureOrganisation(result)
  }

  it should "Include webpage metadata" in {
    val result = controllers.ArticleController.renderArticle(articleUrl, None, None)(TestRequest(articleUrl))
    MetaDataMatcher.ensureWebPage(result, articleUrl)

  }

  it should "Include an old article message" in {
    val result = controllers.ArticleController.renderArticle(articleUrl, None, None)(TestRequest(articleUrl))
    MetaDataMatcher.ensureOldArticleMessage(result, articleUrl)
  }
}
