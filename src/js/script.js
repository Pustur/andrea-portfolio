(($, window, plyr) => {
  // Cache DOM
  const $window = $(window);
  const $root = $('html, body');
  const $html = $('html');
  const $header = $('.header');
  const $hamburger = $('.hamburger');
  const $videoDescription = $('.video-description');
  const $workItems = $('.work-item');
  const $inputs = $('.contact-form__input, .contact-form__textarea');
  const $toTop = $('.to-top');
  const $parallax = $('.parallax');
  const $slider = $('.slider');

  // Variables
  let yPosition = 0;
  let eventAttached = false;
  const plyrInstance = plyr.setup()[0];
  const parallaxHeight = $parallax.height();
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
      const opacity = yPosition / (parallaxHeight - headerHeight);
      $header.css('background-color', `rgba(51, 51, 51, ${opacity})`);

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

  if (plyrInstance) {
    plyrInstance.on('playing', () => {
      $html.addClass('dark-mode');
    });
    plyrInstance.on('pause ended', () => {
      $html.removeClass('dark-mode');
    });
  }

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

  if ($inputs.length) {
    $inputs
      .on('focusin', function onFocus() {
        $(this).prev().addClass('is-label');
      })
      .on('blur', function onBlur() {
        const $this = $(this);

        if ($this.val()) {
          $this.prev().addClass('is-label');
        } else {
          $this.prev().removeClass('is-label');
        }
      });

    $inputs.each((i, el) => {
      const $el = $(el);

      if ($el.val()) {
        $el.trigger('focusin');
      }
    });
  }

  $toTop.on('click', () => {
    $root.animate({
      scrollTop: 0,
    }, 1000);

    return false;
  });

  $hamburger.on('click', toggleMenu);

  // Body
  $window.scroll();

  $parallax.parallax({
    speed: 0.5,
    position: 'center',
  });

  $slider.slick({
    pauseOnFocus: true,
    autoplay: true,
    autoplaySpeed: 4000,
    prevArrow: '<a class="slick-prev" href="javascript:;">Previous</a>',
    nextArrow: '<a class="slick-next" href="javascript:;">Next</a>',
  });
})(jQuery, window, plyr); // eslint-disable-line no-undef
