package conf

import metrics.{FrontendTimingMetric, DurationMetric}

object PngResizerMetrics {
  val downloadTime = FrontendTimingMetric(
    "png-resizer-download-time",
    "Time to download PNG from static"
  )

  val resizeTime = FrontendTimingMetric(
    "png-resizer-resize-time",
    "Time to resize a PNG after it's been downloaded"
  )
}
