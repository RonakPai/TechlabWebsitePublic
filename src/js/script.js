/**
 * The script.js file handles general javascript for all pages
 *
 * @author zacklukem <mayhew.zachary2003@gmail.com>
 * RonakPai <ronakspai@gmail.com>
 *
 */

$(document).ready(function() {
  // Mix It Up Activation
  var portfolio_item = $('.portfolio-contant-active');
  if (portfolio_item.length) {
    var mixer = mixitup(portfolio_item);
  }

  $('.portfolio-single-slider').slick({
    infinite: true,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2000
  });

  $('.clients-logo').slick({
    infinite: true,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2000
  });

  $('.testimonial-slider').slick({
    slidesToShow: 1,
    infinite: true,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2000
  });

  // CountDown JS
  $('.count-down').syotimer({
    year: 2019,
    month: 5,
    day: 9,
    hour: 20,
    minute: 30
  });

  // Init Magnific Popup
  $('.portfolio-popup').magnificPopup({
    delegate: 'a',
    type: 'image',
    gallery: {
      enabled: true
    },
    mainClass: 'mfp-with-zoom',
    navigateByImgClick: true,
    arrowMarkup:
      '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
    tPrev: 'Previous (Left arrow key)',
    tNext: 'Next (Right arrow key)',
    tCounter: '<span class="mfp-counter">%curr% of %total%</span>',
    zoom: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out',
      opener: function(openerElement) {
        return openerElement.is('img')
          ? openerElement
          : openerElement.find('img');
      }
    }
  });

  var map;
  function initialize() {
    var mapOptions = {
      zoom: 13,
      center: new google.maps.LatLng(50.97797382271958, -114.107718560791),
      styles: style_array_here
    };
    map = new google.maps.Map(
      document.getElementById('map-canvas'),
      mapOptions
    );
  }

  var google_map_canvas = $('#map-canvas');

  if (google_map_canvas.length) {
    google.maps.event.addDomListener(window, 'load', initialize);
  }
});
