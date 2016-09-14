import app.FrontendComponents
import play.api.BuiltInComponentsFromContext
import play.api.ApplicationLoader.Context
import test.WithTestContentApiClient

trait TestComponents extends AppComponents with WithTestContentApiClient {
  override lazy val contentApiClient = testContentApiClient
}

class TestAppLoader extends AppLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with TestComponents
}
