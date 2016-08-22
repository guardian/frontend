
import app.FrontendComponents
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import test.TestSettings

class TestAppLoader extends AppLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents with TestSettings
}
