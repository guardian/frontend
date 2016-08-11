
import app.FrontendComponents
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import test.FootballTestData

trait TestComponents extends FootballTestData {
  self: SportServices =>
  override lazy val competitionsService = testCompetitionsService
}

class TestAppLoader extends AppLoader {
  override def buildComponents(context: Context): FrontendComponents = new BuiltInComponentsFromContext(context) with AppComponents with TestComponents
}
