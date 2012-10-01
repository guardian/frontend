
require 'rubygems'

require 'open-uri'
require 'ostruct'
require 'json'
require 'httparty'

require 'models/base'
require 'models/article'
require 'models/related'
require 'models/top_stories'
require 'models/most_popular'

module Api

    def Api.Articles
        log = STDIN.read
        a = Article.new.to_querystring
        log.split("\n").each do |entry|
            if (url = entry.split("\t")[3])
                puts "%s?%s" % [url, a]
            end
        end
    end

    module CoreNavigation

        def CoreNavigation.Related
            log = STDIN.read
            a = Related.new.to_querystring
            log.split("\n").each do |entry|
                if (url = entry.split("\t")[3])
                    puts "%s?%s" % [url, a]
                end
            end
        end

        def CoreNavigation.TopStories
            params = TopStories.new.to_querystring
            puts "/?%s" % [params]
        end

        def CoreNavigation.MostPopular
            
            url = 'http://content.guardianapis.com/sections?format=json'
            response = HTTParty.get(url)
            params = Related.new.to_querystring
            
            JSON.parse(response.body)["response"]["results"].each do |result|
                section = result["id"]
                puts "%s?%s" % [section, params] 
            end

        end
    end
end

def usage
    puts "Usage #{__FILE__} <article|related|top|popular> < path/to/log"
    exit 1
end

def app(type)
    case type
        when 'article'
            Api.Articles
        when 'related'
            Api::CoreNavigation.Related
        when 'top'
            Api::CoreNavigation.TopStories
        when 'popular'
            Api::CoreNavigation.MostPopular
    end
end

usage unless ARGV.first

app ARGV.first

