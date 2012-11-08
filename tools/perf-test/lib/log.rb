# Parse a line of an apache httpd access_log

class Log

    attr_accessor :ip, :method, :status, :resource, :ua, :time

    def parse(entry)
        tokens = entry.split('"')

        @ip         = tokens[0].split(' ').first
        @method     = tokens[1].split(' ').first
        @resource   = tokens[1].split(' ')[1]
        @status     = tokens[2].strip!.split(' ').first.to_i
        @time       = tokens.first.split(' ')[3].split(':').slice(1,6).join(':')
        @ua         = tokens[5]

        self
    end

end
