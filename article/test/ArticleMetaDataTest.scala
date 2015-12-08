package test

import metadata.MetaDataMatcher
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}

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

  val oldToneNewsArticleUrl = "australia-news/2015/oct/01/bronwyn-bishop-will-not-face-charges-over-helicopter-flights"
  it should "include an old article message on an article that is tagged with tone/news (switch is ON)" in {
    conf.switches.Switches.contentAgeMessageSwitch.switchOn()
    val result = controllers.ArticleController.renderArticle(oldToneNewsArticleUrl, None, None)(TestRequest(oldToneNewsArticleUrl))
    MetaDataMatcher.ensureOldArticleMessage(result, oldToneNewsArticleUrl)
  }
  it should "not include an old article message on an article that is not tagged with tone/news (switch is ON)" in {
    conf.switches.Switches.contentAgeMessageSwitch.switchOn()
    val result = controllers.ArticleController.renderArticle(articleUrl, None, None)(TestRequest(articleUrl))
    MetaDataMatcher.ensureNoOldArticleMessage(result, articleUrl)
  }

  it should "not include an old article message on an article that is tagged with tone/news (switch is OFF)" in {
    conf.switches.Switches.contentAgeMessageSwitch.switchOff()
    val result = controllers.ArticleController.renderArticle(oldToneNewsArticleUrl, None, None)(TestRequest(oldToneNewsArticleUrl))
    MetaDataMatcher.ensureNoOldArticleMessage(result, oldToneNewsArticleUrl)
  }
  it should "not include an old article message on an article that is not tagged with tone/news (switch is OFF)" in {
    conf.switches.Switches.contentAgeMessageSwitch.switchOff()
    val result = controllers.ArticleController.renderArticle(articleUrl, None, None)(TestRequest(articleUrl))
    MetaDataMatcher.ensureNoOldArticleMessage(result, articleUrl)
  }

}
