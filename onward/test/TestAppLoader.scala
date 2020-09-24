import app.FrontendComponents
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import test.WithTestContentApiClient

trait TestComponents extends WithTestContentApiClient {
  self: OnwardServices =>
  override lazy val contentApiClient = testContentApiClient
}

class TestAppLoader extends AppLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents with TestComponents
}
