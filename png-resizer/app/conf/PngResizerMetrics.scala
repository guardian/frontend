package conf

import metrics.{CountMetric, FrontendTimingMetric}

object PngResizerMetrics {

  val downloadTime = FrontendTimingMetric(
    "png-resizer-download-time",
    "Time to download PNG from static"
  )

  val resizeTime = FrontendTimingMetric(
    "png-resizer-resize-time",
    "Time to resize a PNG after it's been downloaded"
  )

  val quantizeTime = FrontendTimingMetric(
    "png-resizer-quantize-time",
    "Time to quantize a PNG after it's been resized"
  )

  val notModifiedCount = CountMetric(
    "png-resizer-not-modified-count",
    "Number of 304 responses sent because the PNG wasn't modified"
  )

  val redirectCount = CountMetric(
    "png-resizer-redirect-count",
    "Number of 307 responses sent because we were at capacity"
  )

}
