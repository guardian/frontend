
articles = 'logs/articles'

host = 'http://test-mq-elb.content.guardianapis.com/api'
qs = 'format=json&show-fields=trail-text%2CliveBloggingNow%2Cthumbnail%2CshowInRelatedContent&show-tags=all&show-media=all&edition=UK&show-story-package=true&tag=type%2Fgallery%7Ctype%2Farticle%7Ctype%2Fvideo&order-by=newest&api-key=mattc&user-tier=internal'

File.open(articles).each do |entry|
    url = entry.split("\t")[3].strip!
    puts "%s%s?%s" % [host, url, qs]
end

