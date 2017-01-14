(($, window) => {
  // Cache DOM
  const $window = $(window);
  const $root = $('html, body');
  const $html = $('html');
  const $header = $('.header');
  const $name = $('#name');
  const $hamburger = $('.hamburger');
  const $toTop = $('.to-top');

  // Variables
  let yPosition = 0;
  const nameHeight = $name.height();
  const headerHeight = $header.height();

  // Functions
  function toggleMenu() {
    $html.toggleClass('menu-open');

    setTimeout(() => {
      $html.toggleClass('menu-animation');
    }, 30);
  }

  // Event listeners
  $window.on('scroll', function scrollHandler() {
    yPosition = $(this).scrollTop();

    if (window.matchMedia('(max-width: 767px)').matches) {
      const opacity = yPosition / (nameHeight - headerHeight);
      $header.css('background-color', `rgba(255, 255, 255, ${opacity})`);

      if (opacity >= 1) {
        $header.addClass('shadow');
      } else {
        $header.removeClass('shadow');
      }
    } else {
      $header.css('background-color', '');
    }
  });

  $toTop.on('click', () => {
    $root.animate({
      scrollTop: 0,
    }, 1000);
    return false;
  });

  $hamburger.on('click', toggleMenu);

  // Body
  $window.scroll();

  $name.parallax({
    imageSrc: '/img/parallax-mountains.jpg',
    speed: 0.5,
    position: 'center bottom',
  });
})(jQuery, window); // eslint-disable-line no-undef
