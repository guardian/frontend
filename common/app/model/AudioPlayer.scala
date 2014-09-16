package model

case class AudioPlayer(
  audio: Content,
  audioElement: AudioElement,
  title: String,
  autoPlay: Boolean
)
