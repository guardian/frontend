package test

import contentapi.ContentApiClient
import controllers.ArticleController
import metadata.MetaDataMatcher
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover class ArticleMetaDataTest
  extends FlatSpec
  with Matchers
  with ConfiguredTestSuite
  with BeforeAndAfterAll
  with WithMaterializer
  with WithTestWsClient
  with WithTestApplicationContext
  with WithTestContentApiClient {

  val articleUrl = "environment/2012/feb/22/capitalise-low-carbon-future"
  val oldSportUrl = "sport/2015/sep/11/how-women-in-tennis-achieved-equal-pay-us-open"

  lazy val articleController = new ArticleController(
    testContentApiClient,
    play.api.test.Helpers.stubControllerComponents(),
    wsClient
  )

  it should "Include organisation metadata" in {
    val result = articleController.renderArticle(articleUrl)(TestRequest(articleUrl))
    MetaDataMatcher.ensureOrganisation(result)
  }

  it should "Include webpage metadata" in {
    val result = articleController.renderArticle(articleUrl)(TestRequest(articleUrl))
    MetaDataMatcher.ensureWebPage(result, articleUrl)

  }

  val oldToneNewsArticleUrl = "australia-news/2015/oct/01/bronwyn-bishop-will-not-face-charges-over-helicopter-flights"
  it should "include an old article message on an article that is tagged with tone/news" in {
    val result = articleController.renderArticle(oldToneNewsArticleUrl)(TestRequest(oldToneNewsArticleUrl))
    MetaDataMatcher.ensureOldArticleMessage(result, oldToneNewsArticleUrl)
  }

  val oldToneCommentArticleUrl = "environment/2012/feb/22/capitalise-low-carbon-future"
  it should "include an old article message on an article that is tagged with tone/comment" in {
    val result = articleController.renderArticle(oldToneCommentArticleUrl)(TestRequest(oldToneCommentArticleUrl))
    MetaDataMatcher.ensureOldArticleMessage(result, oldToneCommentArticleUrl)
  }

  it should "not include an old article message on an article that is not tagged with tone/news or with tone/comment" in {
    val result = articleController.renderArticle(oldSportUrl)(TestRequest(oldSportUrl))
    MetaDataMatcher.ensureNoOldArticleMessage(result, oldSportUrl)
  }

}
