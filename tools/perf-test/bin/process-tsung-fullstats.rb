
# Script to extract performance data from tsung-fullstats.log files

def parse(log, key) 

    File.read(log).split('{').map { |entry|
        next unless (entry =~ /#{key}/)
        entry.scan(/\[.+\]/m).map { |group|
            group.split(',').map { |timestamp|
                timestamp.scan(/[\d\.]/).join('')
            }
        }
    }.compact!.flatten!

end

# -------

def usage
    puts "
     Usage: #{__FILE__} <path/to/tsung-fullstats.log> <stat>
        
        <stat>
         request: Response time for each request.
         connect: Duration of the connection establishment.
         page: Response time for each set of requests.
    "
    exit 1
end

def app
    opts = { :log => ARGV.first, :key => ARGV[1]}
    usage unless (opts[:log] && opts[:key] && (opts[:key] =~ /^(page|connect|request)$/))
    key = "(sample,%s)" % [opts[:key]]
    parse(opts[:log], opts[:key]).join("\n")
end

puts app

