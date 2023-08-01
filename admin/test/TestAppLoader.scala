import app.FrontendComponents
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext

trait TestComponents {
  self: AppComponents =>

  // Don't run lifecycle components in tests
  override lazy val lifecycleComponents = List()
}

class TestAppLoader extends AppLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents with TestComponents
}
