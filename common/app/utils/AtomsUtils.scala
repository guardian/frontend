package utils
import com.gu.contentatom.thrift.atom.audio.AudioAtom

object AtomsUtils {

  def durationStr(audio: AudioAtom): String = {
    val duration = audio.duration
    val hours = duration / 3600
    val minutes = (duration - hours * 3600) / 60
    val seconds = duration - hours * 3600 - minutes * 60
    f"$hours%02d:$minutes%02d:$seconds%02d"
  }
}
