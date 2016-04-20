package model

case class AudioPlayer(
  audio: ContentType,
  audioElement: AudioElement,
  title: String,
  autoPlay: Boolean
)
