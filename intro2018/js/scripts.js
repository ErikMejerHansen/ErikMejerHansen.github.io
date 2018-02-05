(function($) {
    "use strict";

    new WOW().init();
    var currentHeght = 0;
    $(window).keypress(function(event) {
        if(event.keyCode === 13 || event.keyCode === 32) {
          currentHeght += $( window ).height();
        } else {
          currentHeght -= $( window ).height();
        }



        $('html, body').stop().animate({
            scrollTop: currentHeght
        }, 1450, 'easeInOutExpo');
        event.preventDefault();
    });

    $('.navbar-collapse ul li a').click(function() {
        /* always close responsive nav after click */
        $('.navbar-toggle:visible').click();
    });

    $('#galleryModal').on('show.bs.modal', function (e) {
       $('#galleryImage').attr("src",$(e.relatedTarget).data("src"));
    });

})(jQuery);
