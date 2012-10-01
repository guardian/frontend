
require 'rubygems'

require 'models/base'
require 'models/related'
require 'models/top_stories'
require 'models/most_popular'

require 'json'
require 'httparty'

url = 'http://content.guardianapis.com/sections?format=json&api-key=techdev-internal'

response = HTTParty.get(url)

JSON.parse(response.body)["response"]["results"].each do |result|

    section = result["id"]
    params = Related.new.to_querystring
    puts "%s?%s" % [section, params] 

end

puts '# ------- ' 

    f = TopStories.new.to_querystring
    puts "/?%s" % [f]


puts '# ------- ' 

log = STDIN.read

a = Related.new.to_querystring

log.split("\n").each do |entry|
    if (url = entry.split("\t")[3])
        puts "%s?%s" % [url, a]
    end
end


# most-popular/UK/technology?callback=showMostPopular
# technology/2012/sep/30/google-self-driving-car-unemployment

