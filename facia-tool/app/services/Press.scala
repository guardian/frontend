package services

object Press {
  def fromSetOfIds(ids: Set[String]) = {
    FaciaPress.press(PressCommand(
      ids,
      live = true,
      draft = true
    ))
  }

  def fromSetOfIdsWithForceConfig(ids: Set[String]) = {
    FaciaPress.press(PressCommand(
      ids,
      live = true,
      draft = true,
      forceConfigUpdate = Option(true)))}
}
