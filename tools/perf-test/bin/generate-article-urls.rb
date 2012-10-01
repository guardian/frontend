
require 'open-uri'
require 'ostruct'

require 'models/base'
require 'models/article'

log = STDIN.read

a = Article.new.to_querystring

log.split("\n").each do |entry|
    if (url = entry.split("\t")[3])
        puts "%s?%s" % [url, a]
    end
end
