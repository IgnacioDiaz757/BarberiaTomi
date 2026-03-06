'use strict';

(function () {
    var wrapper = document.querySelector('.hero_slider-wrapper');
    var heroSection = document.querySelector('.hero');
    if (!wrapper || !heroSection) return;

    var defaultSlides = [
        'Img/glyphicons/1.png',
        'Img/glyphicons/2.png',
        'Img/3.png',
    ];

    function buildSlideDivs(urls) {
        var html = '';
        for (var i = 0; i < urls.length; i++) {
            var url = urls[i] || '';
            html += '<div class="hero_slider-slide swiper-slide" data-bg="' + String(url).replace(/"/g, '&quot;') + '"></div>';
        }
        wrapper.innerHTML = html;
    }

    function initHeroSlider() {
        if (typeof Swiper === 'undefined') return;
        var swiper = new Swiper('.hero_slider', {
            direction: 'horizontal',
            loop: true,
            speed: 1000,
            slidesPerView: 1,
            pagination: {
                el: '.hero_slider-pagination',
                type: 'progressbar',
            },
            navigation: {
                nextEl: '.hero_slider-control--next',
                prevEl: '.hero_slider-control--prev',
            },
            autoplay: {
                delay: 5000,
            },
        });
        var slides = wrapper.querySelectorAll('.swiper-slide');
        function setHeroBg() {
            if (slides.length && swiper.activeIndex < slides.length) {
                var path = slides[swiper.activeIndex].dataset.bg;
                if (path) heroSection.style.backgroundImage = 'url("' + path + '")';
            }
        }
        swiper.on('slideChange', setHeroBg);
        setHeroBg();
    }

    function run() {
        buildSlideDivs(defaultSlides);
        initHeroSlider();
    }

    var supabase = window.supabaseClient;
    if (!supabase) {
        run();
        return;
    }

    supabase
        .from('hero_slides')
        .select('image_url')
        .order('position', { ascending: true })
        .then(function (result) {
            if (result.error || !result.data || result.data.length === 0) {
                buildSlideDivs(defaultSlides);
            } else {
                var urls = result.data.map(function (row) { return row.image_url; });
                buildSlideDivs(urls);
            }
            initHeroSlider();
        })
        .catch(function () {
            buildSlideDivs(defaultSlides);
            initHeroSlider();
        });
})();
