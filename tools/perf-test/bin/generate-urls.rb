
require 'rubygems'

require 'open-uri'
require 'ostruct'

require 'models/base'
require 'models/article'
require 'models/related'
require 'models/top_stories'
require 'models/most_popular'

module Api

    def Api.Articles(log, mode)
        log.split("\n").each do |entry|
            next unless (url = entry.split("\t")[3])
            a = Article.new(url)
            puts (mode === 'api') ? a.to_api : a.to_www
        end
    end

    module CoreNavigation

        def CoreNavigation.Related(log, mode)
            log.split("\n").each do |entry|
                next unless (url = entry.split("\t")[3])
                r = Related.new(url)
                puts (mode === 'api') ? r.to_api : r.to_www
            end
        end
        
        def CoreNavigation.TopStories(mode)
            list_of_trailblocks = %w{sport commentisfree culture business lifeandstyle money travel}.push('')
            list_of_trailblocks.each do |trail|
                uk = TopStories.new(trail)
                us = TopStories.new(trail, { :edition => 'US' })
                puts (mode === 'api') ? uk.to_api : uk.to_www
                puts (mode === 'api') ? us.to_api : us.to_www
            end
        end

        def CoreNavigation.MostPopular(mode)
            list_of_sections = %w{sport commentisfree culture business lifeandstyle money travel}.push('')
            list_of_sections.each do |section|
                mp = MostPopular.new(section)
                puts (mode === 'api') ? mp.to_api : mp.to_www
            end

        end
    end
end

def usage
    puts "Usage #{__FILE__} <article|related|top|popular> <api|www> < path/to/log"
    exit 1
end

def app(type, mode)
    case type
        when 'article'
            Api.Articles STDIN.read, mode
        when 'related'
            Api::CoreNavigation.Related STDIN.read, mode
        when 'top'
            Api::CoreNavigation.TopStories mode
        when 'popular'
            Api::CoreNavigation.MostPopular mode
    end
end

opts = {:type => ARGV.first, :mode => ARGV[1]}

usage unless (opts[:type] && opts[:mode] && (opts[:mode] =~ /^(api|www)$/))

app opts[:type], opts[:mode]
