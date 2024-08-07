import app.FrontendComponents
import services.S3Client
import org.mockito.Mockito._
import org.scalatestplus.mockito.MockitoSugar
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import renderers.DotcomRenderingService
import test.WithTestContentApiClient
import test.DCRFake

trait TestComponents extends WithTestContentApiClient {
  self: AppComponents =>

  override lazy val contentApiClient = testContentApiClient

  // Relying on DCR output for tests is always a mistake.
  override lazy val remoteRender: DotcomRenderingService = new DCRFake()

  // Do not run lifecycle components in tests
  override lazy val lifecycleComponents = List()
}

class TestAppLoader extends AppLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents with TestComponents
}
