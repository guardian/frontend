package test

import metadata.MetaDataMatcher
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover class ArticleMetaDataTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  val articleUrl = "environment/2012/feb/22/capitalise-low-carbon-future"

  it should "Include organisation metadata" in {
    val result = controllers.ArticleController.renderArticle(articleUrl)(TestRequest(articleUrl))
    MetaDataMatcher.ensureOrganisation(result)
  }

  it should "Include webpage metadata" in {
    val result = controllers.ArticleController.renderArticle(articleUrl)(TestRequest(articleUrl))
    MetaDataMatcher.ensureWebPage(result, articleUrl)

  }

  val oldToneNewsArticleUrl = "australia-news/2015/oct/01/bronwyn-bishop-will-not-face-charges-over-helicopter-flights"
  it should "include an old article message on an article that is tagged with tone/news" in {
    val result = controllers.ArticleController.renderArticle(oldToneNewsArticleUrl)(TestRequest(oldToneNewsArticleUrl))
    MetaDataMatcher.ensureOldArticleMessage(result, oldToneNewsArticleUrl)
  }
  it should "not include an old article message on an article that is not tagged with tone/news" in {
    val result = controllers.ArticleController.renderArticle(articleUrl)(TestRequest(articleUrl))
    MetaDataMatcher.ensureNoOldArticleMessage(result, articleUrl)
  }

}
