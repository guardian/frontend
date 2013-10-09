## Issues with new Content API

No editors picks appeared (not yet implemented I believe).

Does not fully support tag queries e.g. client.tag("type/gallery|type/article|type/video|type/sudoku") will return content that does not have any of those tags.

Still slow on queries with lots of elements (example of slow query)(see point 5)

Does not gzip responses (this might actually be the source of slowness, receiving takes longer than waiting).

Does not show external references (e.g. football competitions)

Things that should not have related content do have related content: /uk/2012/aug/29/eva-rausing-information-murder-olaf-palme

Related content does not return exactly the same thing (I don not really consider this to be a problem).
