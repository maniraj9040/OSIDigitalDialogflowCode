
    function chat_add_message(message, isUser) {
        console.log(message);  
      var person = isUser ? 'user' : '';
        var html = '\
        <div class="chat_line">\
            <div class="chat_bubble'+person+'">\
              <div class="chat_triangle'+person+'"></div>\
               '+message+' \
            </div>\
        </div>\
        ';
        chat_add_html(html);
    }
    // Add HTML to the chat
    function chat_add_html(html) {
        $("#chat_log").append(html);
        chat_scrolldown();
    }

    function chat_scrolldown() {
        $("#chat_log").animate({ scrollTop: $("#chat_log")[0].scrollHeight }, 500);
    }

    $(function() {
       $('#chat_input').on('keypress', function(event) {
          if (event.which === 13 && $(this).val() != ""){
             var message = $(this).val();
             $(this).val("");
             chat_add_message(message, true);
             
            $.ajax({
                url: 'http://127.0.0.1:7000/',
                type: 'GET',
                cache: false,
                contentType:'application/x-www-form-urlencoded; charset=UTF-8',
                data : {"msg":message},
                dataType : "json",
                success: function(event)  {
                    console.log(event.text);
                    var message_received = event.text;
                    chat_add_message(message_received, false);
                }             
            })

          }

       });

    });

    function autosubmit(value,a){
      document.getElementById("chat_input").value = value ;
    }

    $(document).ready(function(){
   $("img").click(function(){
        $("div").slideToggle();
    });
    });