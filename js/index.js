/**
 * Barbercrop
 * Barbercrop is a full featured barber shop template
 * Exclusively on https://1.envato.market/barbercrop-html
 *
 * @encoding        UTF-8
 * @version         1.0.4
 * @copyright       (C) 2018 - 2022 Merkulove ( https://merkulov.design/ ). All rights reserved.
 * @license         Envato License https://1.envato.market/KYbje
 * @contributors    Lamber Lilith (winter.rituel@gmail.com)
 * @support         help@merkulov.design
 **/
'use strict';

import {initHeroSlider} from "./modules/slider";

document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider('.hero', '.hero_slider', {
        direction: 'horizontal',
        loop: true,
        speed: 1000,
        slidesPerView: 1,
        pagination: {
            el: '.swiper-pagination',
            type: "progressbar",
        },
        navigation: {
            nextEl: '.hero_slider-control--next',
            prevEl: '.hero_slider-control--prev',
        },
        autoplay: {
            delay: 5000
        },

    })
})