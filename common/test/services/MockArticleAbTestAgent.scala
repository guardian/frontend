package services

import contentapi.ContentApiClient
import org.mockito.Mockito.mock

import scala.concurrent.{ExecutionContext, Future}

class MockArticleAbTestAgent extends ArticleAbTestAgent(mock(classOf[ContentApiClient])) {
  override def refresh()(implicit ec: ExecutionContext): Future[Unit] = Future.unit
}
