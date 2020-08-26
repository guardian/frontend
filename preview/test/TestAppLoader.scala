import app.FrontendComponents
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import test.WithTestContentApiClient

trait TestComponents extends AppComponents with WithTestContentApiClient {
  override lazy val contentApiClient = testPreviewContentApiClient
}

class TestAppLoader extends AppLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with TestComponents
}
