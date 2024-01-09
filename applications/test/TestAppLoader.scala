import app.FrontendComponents
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import test.WithTestContentApiClient

trait TestComponents extends WithTestContentApiClient {
  self: AppComponents =>
  override lazy val contentApiClient = testContentApiClient

  // Do not run lifecycle components in tests
  override lazy val lifecycleComponents: List[Nothing] = List()
}

class TestAppLoader extends AppLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents with TestComponents
}
