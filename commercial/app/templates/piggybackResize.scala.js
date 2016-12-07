@(width: Int, height: Int)(implicit request: RequestHeader)

window.parent.postMessage(JSON.stringify({
    type: 'set-ad-height',
    value: {
      id: window.frameElement.id,
      width: @width,
      height: @height
    }
  }), '*');

