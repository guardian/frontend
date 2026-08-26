package services

import com.gu.facia.api.models.PublicationStatus
import com.gu.facia.client.ApiClient
import com.gu.facia.client.models.{CustomSubnav, CustomSubnavConfig}
import model.{ApplicationIdentity, Content}

import scala.concurrent.{ExecutionContext, Future}

class MockSubnavAgent extends SubnavAgent(ApplicationIdentity("mock")) {
  override def isLoaded(): Boolean = true
  override def getSubnavConfig(): Option[CustomSubnavConfig] = None
  override def getSubnavForFront(frontId: String, status: PublicationStatus): Option[CustomSubnav] = None
  override def getSubnavForContent(content: Content, status: PublicationStatus): Option[CustomSubnav] = None
  override def getClient(implicit ec: ExecutionContext): ApiClient = ???
  override def refresh()(implicit ec: ExecutionContext): Future[Unit] = Future.unit
}
