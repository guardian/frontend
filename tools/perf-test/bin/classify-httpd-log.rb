
require 'rubygems'
require 'lib/log.rb'
require 'lib/classifier.rb'

def help
    puts "Usage: #{__FILE__} <file>"
    exit
end

def classify(access_log)
    File.open(access_log).each do |entry|
        begin    
            log = Log.new().parse entry
            classifier = Classifier.new()
            type = classifier.whatami log.resource
            puts [log.status, log.time, type, classifier.cleaned_resource].join("\t")
        rescue
            warn entry
        end
    end
end

# ---

access_log = ARGV.first

help unless access_log

classify(access_log)

