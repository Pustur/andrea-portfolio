(($, window, plyr) => {
  // Cache DOM
  const $window = $(window);
  const $root = $('html, body');
  const $html = $('html');
  const $header = $('.header');
  const $name = $('#name');
  const $hamburger = $('.hamburger');
  const $videoDescription = $('.video-description');
  const $workItems = $('.work-item');
  const $toTop = $('.to-top');

  // Variables
  let yPosition = 0;
  let eventAttached = false;
  const plyrInstance = plyr.setup()[0];
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

  $window.on('resize', () => $window.scroll());

  plyrInstance.on('playing', () => {
    $html.addClass('dark-mode');
  });
  plyrInstance.on('pause ended', () => {
    $html.removeClass('dark-mode');
  });

  $workItems.hover(function mouseEnter() {
    $workItems.addClass('disabled');
    $(this).removeClass('disabled');
  }, () => {
    $workItems.removeClass('disabled');
  });

  $workItems.on('click', function selectVideo() {
    const $this = $(this);
    const $videoPlayer = $('.video-player');
    const videoOffset = $videoPlayer.offset().top;
    const videoHeight = $videoPlayer.height();
    const windowHeight = $window.height();
    const scrollPosition = (videoOffset + (videoHeight / 2)) - (windowHeight / 2);

    $root.animate({
      scrollTop: scrollPosition,
    }, 1000).promise().then(() => {
      $videoDescription.html($this.find('.work-item__description').html());

      plyrInstance.source({
        type: 'video',
        title: $this.find('.work-item__title').text(),
        sources: [
          {
            src: $this.attr('data-work-id'),
            type: 'vimeo',
          },
        ],
      });

      if (!eventAttached) {
        plyrInstance.on('ready', () => plyrInstance.play());
        eventAttached = true;
      }
    });

    return false;
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
})(jQuery, window, plyr); // eslint-disable-line no-undef
