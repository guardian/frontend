package layout

/** For now we are hardcoding the IDs of the containers here while we test if this helps performance on mobile devices.
  *
  * If it does, then we will introduce the idea of desktop-only containers to Facia Tool.
  */
object DesktopOnlyContainers {
  val InBrief = "8852-9cf6-d938-01fb"
  val WhatWereReading = "54d7dcce-93db-4d11-a0d0-0e6d69980918"
  val TakePart = "eaf2df82-f7b4-4d96-a681-db52be53c798"
  val People = "uk-alpha/people-in-the-news/feature-stories"
  val RobTestContainer = "e5737dab-cc0f-4ea2-bb6a-6992cb21ac8e"

  val all = Set(
    InBrief,
    WhatWereReading,
    TakePart,
    People,
    RobTestContainer
  )
}
