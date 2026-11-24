package services

import ab.ABTests
import conf.switches.Switches.{EditorialABTests, EditorialArticleABTests}
import model.{ArticlePage, BlockRange, InteractivePage}
import model.meta.BlocksOn
import play.api.mvc.{RequestHeader, Result}

import scala.concurrent.{ExecutionContext, Future}

/** Selects, loads and renders editorial article ab test variants, leaving original rendering and error recovery to the
  * caller.
  */
class ArticleABTestService(
    capiLookup: CAPILookup,
    articleAbTestAgent: ArticleAbTestAgent,
    variantRenderer: ArticleVariantRenderer,
)(implicit ec: ExecutionContext) {

  /** None means no distinct variant was selected. The original is used only if a selected variant cannot be rendered.
    * Failed lookups or renders remain failures, rather than falling back to the original.
    */
  def renderVariant(path: String, range: BlockRange)(
      articleModifier: BlocksOn[ArticlePage] => BlocksOn[ArticlePage] = identity,
      interactiveModifier: BlocksOn[InteractivePage] => BlocksOn[InteractivePage] = identity,
  )(renderOriginal: => Future[Result])(implicit request: RequestHeader): Option[Future[Result]] = {
    val isWebUserInVariantBBucket =
      EditorialABTests.isSwitchedOn && EditorialArticleABTests.isSwitchedOn &&
        ArticleVariantRenderer.supportsRequest && ABTests.isUserInTestGroup("fronts-and-curation-editorial-test", "b")

    val variantPath =
      if (isWebUserInVariantBBucket) articleAbTestAgent.variantFor(path).filterNot(_ == path)
      else None

    variantPath.map { pathToRender =>
      capiLookup
        .lookup(pathToRender, Some(range), Some(CAPIChannel.Variant))
        .flatMap(response => variantRenderer.render(response, path)(articleModifier, interactiveModifier))
        .flatMap {
          case Some(result) => Future.successful(result)
          case None         => renderOriginal
        }
    }
  }
}
