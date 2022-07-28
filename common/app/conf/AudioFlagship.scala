package conf

object AudioFlagship {
  val tagName: String = "news/series/todayinfocus"
  val title: String = "Today in Focus"
  val seriesId: String = "today-in-focus"
  val description: String =
    "Listen to the story behind the headlines for a deeper understanding of the news. <strong>Every weekday with Nosheen Iqbal and Michael Safi</strong>."
  val subscribeLinks: Map[String, String] = Map(
    "Apple Podcasts" -> "https://itunes.apple.com/gb/podcast/today-in-focus/id1440133626?mt=2",
    "Google Podcasts" -> "https://www.google.com/podcasts?feed=aHR0cHM6Ly93d3cudGhlZ3VhcmRpYW4uY29tL25ld3Mvc2VyaWVzL3RvZGF5aW5mb2N1cy9wb2RjYXN0LnhtbA%3D%3D",
    "Spotify" -> "https://open.spotify.com/show/2cSQmzYnf6LyrN0Mi6E64p",
  )
}
