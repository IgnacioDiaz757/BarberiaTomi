 'use strict';

 (function () {
     var audio = document.getElementById('global-audio');
     var container = document.querySelector('.global-audio-player');
     if (!audio || !container) return;

     var button = container.querySelector('.audio-toggle');
     if (!button) return;

     function setState(isPlaying) {
         if (isPlaying) {
             button.textContent = 'II';
             button.classList.remove('is-paused');
             button.setAttribute('aria-label', 'Pausar música');
         } else {
             button.textContent = '►';
             button.classList.add('is-paused');
             button.setAttribute('aria-label', 'Reproducir música');
         }
     }

     function tryPlay() {
         audio.play()
             .then(function () {
                 setState(true);
             })
             .catch(function () {
                 // Autoplay puede estar bloqueado; dejamos el botón en estado "pausado"
                 setState(false);
             });
     }

     button.addEventListener('click', function () {
         if (audio.paused) {
             audio.play().then(function () {
                 setState(true);
             }).catch(function () {
                 setState(false);
             });
         } else {
             audio.pause();
             setState(false);
         }
     });

     window.addEventListener('load', tryPlay);
 })();

