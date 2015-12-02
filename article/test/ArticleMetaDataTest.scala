package test

import metadata.MetaDataMatcher
import org.jsoup.Jsoup
import play.api.libs.json._
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._
import conf.switches.Switches.contentAgeMessageSwitch

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

  val defaultSwitchStateOn = contentAgeMessageSwitch.isSwitchedOn

  contentAgeMessageSwitch.switchOn()
  val oldToneNewsArticleUrl = "australia-news/2015/oct/01/bronwyn-bishop-will-not-face-charges-over-helicopter-flights"
  it should "include an old article message on an article that is tagged with tone/news (switch is ON)" in {
    val result = controllers.ArticleController.renderArticle(oldToneNewsArticleUrl, None, None)(TestRequest(oldToneNewsArticleUrl))
    MetaDataMatcher.ensureOldArticleMessage(result, oldToneNewsArticleUrl)
  }
  it should "not include an old article message on an article that is not tagged with tone/news (switch is ON)" in {
    val result = controllers.ArticleController.renderArticle(articleUrl, None, None)(TestRequest(articleUrl))
    MetaDataMatcher.ensureNoOldArticleMessage(result, articleUrl)
  }

  contentAgeMessageSwitch.switchOff()
  it should "not include an old article message on an article that is tagged with tone/news (switch is OFF)" in {
    val result = controllers.ArticleController.renderArticle(oldToneNewsArticleUrl, None, None)(TestRequest(oldToneNewsArticleUrl))
    MetaDataMatcher.ensureNoOldArticleMessage(result, oldToneNewsArticleUrl)
  }

  it should "not include an old article message on an article that is not tagged with tone/news (switch is OFF)" in {
    val result = controllers.ArticleController.renderArticle(articleUrl, None, None)(TestRequest(articleUrl))
    MetaDataMatcher.ensureNoOldArticleMessage(result, articleUrl)
  }

  if (defaultSwitchStateOn) contentAgeMessageSwitch.switchOn()

}
