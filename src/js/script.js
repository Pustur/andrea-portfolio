(($, window, document, plyr) => {
  // Cache DOM
  const $window = $(window);
  const $document = $(document);
  const $html = $('html');
  const $body = $('body');
  const $root = $html.add($body);
  const $header = $('.header');
  const $hamburger = $('.hamburger');
  const $inDocumentLinks = $('a[href^="#"]:not([href="#"])');
  const $workItems = $('.work-item');
  const $workItemLinks = $workItems.find('.work-item__link');
  const $inputs = $('.contact-form__input, .contact-form__textarea');
  const $toTop = $('.to-top');
  const $parallax = $('.parallax');
  const $slider = $('.slider');
  const $menuItems = $('.main-menu__item');
  const $menuWorksItem = $menuItems.eq(1);

  // Variables
  let yPosition = 0;
  const plyrInstance = plyr.setup()[0];
  const parallaxHeight = $parallax.height();
  const headerHeight = $header.height();
  const modalFadeInTime = 300;
  const language = $html.attr('lang');

  // Functions
  function toggleMenu() {
    $html.toggleClass('menu-open');

    setTimeout(() => {
      $html.toggleClass('menu-animation');
    }, 30);
  }

  function openModal(contents) {
    const {
      title,
      description,
      technicalDescription,
      videoId,
      imageUrl,
      closeLabel,
      myRoleLabel,
    } = contents;
    const html = `
      <div class="modal" style="display: none;">
        <div class="modal__scrolling-container">
          <a href="javascript:;" class="modal__close">${closeLabel}</a>
          <div class="container bigger">
            <div class="row">
              <div class="modal__work-video">
                ${
                  videoId ?
                  `<div data-type="vimeo" data-video-id="${videoId}"></div>` :
                  `<img src="${imageUrl}" alt />`
                }
              </div>
              <div class="modal__work-info">
                <h2 class="modal__work-title no-margin-top">${title}</h2>
                <div class="modal__work-description">${description}</div>
                ${
                  technicalDescription ?
                  `<h3>${myRoleLabel}</h3>
                  <div class="modal__work-technical-description">${technicalDescription}</div>` :
                  ''
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    const $modal = $(html);

    $body.addClass('overflow-hidden');
    $modal.appendTo($body).fadeIn(modalFadeInTime);
    plyr.setup();
  }

  function closeModal() {
    const $modal = $('.modal');

    $modal.fadeOut(modalFadeInTime, () => {
      $modal.remove();
      $body.removeClass('overflow-hidden');
    });
  }

  function getUrlParam(url, name) {
    const regex = new RegExp(`${name}=([^&]*)`);
    const matches = regex.exec(url);

    if (matches) {
      return matches[1];
    }

    return undefined;
  }

  function handleSubMenu(e) {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      const $target = $(e.currentTarget);
      const $subMenu = $target.find('> ul');

      $subMenu.stop(true);

      if (e.type === 'mouseenter') {
        $subMenu.slideDown();
      } else {
        $subMenu.slideUp();
      }
    }
  }

  function changeLanguage(lang) {
    const currentUrl = window.location.href;
    const regex = /(\/)[a-z]{2}(?=\/|$)/;
    const newUrl = currentUrl.replace(regex, (match, p1) => `${p1}${lang}`);

    window.location.href = newUrl; // eslint-disable-line no-param-reassign
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

  $window.on('keydown', (e) => {
    if (e.which === 27) {
      closeModal();
    }
  });

  $document.on('click', '.modal__close', closeModal);

  $document.on('click', '.languages-menu__link', (e) => {
    const selectedLanguage = $(e.currentTarget).text();

    e.preventDefault();
    changeLanguage(selectedLanguage);
  });

  $document.on('change', '.languages-select', (e) => {
    const selectedLanguage = $(e.currentTarget).find(':selected').val();

    changeLanguage(selectedLanguage);
  });

  if (plyrInstance) {
    plyrInstance.on('playing', () => {
      $html.addClass('dark-mode');
    });
    plyrInstance.on('pause ended', () => {
      $html.removeClass('dark-mode');
    });
  }

  $workItemLinks.on('click', (e) => {
    const $target = $(e.currentTarget);
    const $metadata = $target.closest('li').find('.work-item__metadata');
    const title = $metadata.find('.work-item__title').html() || $target.find('.work-item__cover-title').html();
    const description = $metadata.find('.work-item__description').html();
    const technicalDescription = $metadata.find('.work-item__technical-description').html();
    const closeLabel = $metadata.find('.work-item__close-label').html();
    const myRoleLabel = $metadata.find('.work-item__my-role-label').html();
    const videoId = $target.attr('data-work-id');
    const imageUrl = $target.attr('data-work-image');

    e.preventDefault();
    openModal({
      title,
      description,
      technicalDescription,
      videoId,
      imageUrl,
      closeLabel,
      myRoleLabel,
    });
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

  $inDocumentLinks.on('click', (e) => {
    const hash = e.currentTarget.hash;
    const $target = $(hash);

    if ($target.length) {
      e.preventDefault();
      $root.animate({
        scrollTop: $target.offset().top,
      }, 1000, () => {
        window.location.hash = hash; // eslint-disable-line no-param-reassign
      });
    }
  });

  $hamburger.on('click', toggleMenu);

  $menuItems.on('mouseenter', handleSubMenu);

  $menuItems.on('mouseleave', handleSubMenu);

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

  $menuWorksItem.append(`
    <ul class="unstyled-list">
      <li class="main-menu__item">
        <a class="main-menu__link" href="/${language}/works?category=linear-audio">Linear Audio</a>
      </li>
      <li class="main-menu__item">
        <a class="main-menu__link" href="/${language}/works?category=game-audio">Game Audio</a>
      </li>
    </ul>
  `);

  if ($workItems.length) {
    const query = window.location.search;
    const category = getUrlParam(query, 'category');

    if (category) {
      $workItems.not(`[data-category=${category}]`).remove();
    }
  }
})(jQuery, window, document, plyr); // eslint-disable-line no-undef
