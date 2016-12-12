package model

import play.api.Environment

class ApplicationContext(env: Environment) {
  implicit val environment = env
}
