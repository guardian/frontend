class Article 
    
    include ContentApi

    def initialize(path)
        super
        @params.show_fields = 'all'
        @params.show_tags = 'all'
        @params.show_media = 'all'
        @params.show_story_package = 'true'
        @params.tag = 'type,gallery,type,article,type,video'
        @params.order_by = 'newest'
    end

end
