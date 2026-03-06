'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error('Supabase client no configurado.');
        return;
    }

    const grid = document.querySelector('.gallery_content-media');
    const filterLinks = document.querySelectorAll('.gallery_content-filters_filter');

    let allItems = [];

    async function loadGallery() {
        if (!grid) {
            console.error('No se encontró .gallery_content-media');
            return;
        }

        grid.innerHTML = '<p class="text" style="padding:1rem">Cargando galería…</p>';

        const { data, error } = await supabase
            .from('gallery_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error cargando galería desde Supabase', error);
            const errorEl = document.createElement('p');
            errorEl.className = 'text';
            errorEl.style.padding = '1rem';
            errorEl.textContent = 'No se pudo cargar la galería. Revisá la consola (F12) para más detalles.';
            grid.appendChild(errorEl);
            return;
        }

        allItems = Array.isArray(data) ? data : [];
        console.log('[Galería] Registros desde Supabase:', allItems.length, allItems);
        renderItems('all');
    }

    function renderItems(category) {
        if (!grid) return;

        grid.innerHTML = '';
        const items = category === 'all' ? allItems : allItems.filter((item) => item.category === category);
        console.log('[Galería] Renderizando categoría:', category, '| ítems a mostrar:', items.length);

        if (items.length === 0) {
            const emptyEl = document.createElement('p');
            emptyEl.className = 'text';
            emptyEl.textContent = 'Todavía no hay elementos en esta categoría.';
            grid.appendChild(emptyEl);
            return;
        }

        items.forEach((item) => {
            const figure = document.createElement('figure');
            figure.className = 'gallery_content-media_item col-6 col-md-6';
            figure.dataset.category = item.category || '';

            const isVideo = item.media_type === 'video';

            const aspectWrap = document.createElement('div');
            aspectWrap.className = 'aspect';

            const aspectInner = document.createElement('div');
            aspectInner.className = 'aspect__inner';

            if (isVideo) {
                const video = document.createElement('video');
                video.className = 'gallery-video';
                video.src = item.media_url;
                video.controls = true;
                video.playsInline = true;
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'cover';
                aspectInner.appendChild(video);
            } else {
                const picture = document.createElement('picture');
                const img = document.createElement('img');
                img.className = 'gallery-img';
                img.src = item.media_url;
                img.alt = item.title || 'Corte de ejemplo';
                img.loading = 'lazy';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                picture.appendChild(img);
                aspectInner.appendChild(picture);
            }

            aspectWrap.appendChild(aspectInner);
            figure.appendChild(aspectWrap);
            grid.appendChild(figure);
        });

        initScrollReveal();
    }

    function initScrollReveal() {
        const items = grid ? grid.querySelectorAll('.gallery_content-media_item') : [];
        if (items.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('gallery-item-inview');
                    } else {
                        entry.target.classList.remove('gallery-item-inview');
                    }
                });
            },
            { rootMargin: '0px 0px -15% 0px', threshold: 0.1 }
        );

        items.forEach((el) => observer.observe(el));
    }

    filterLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const target = link.dataset.target || 'all';

            filterLinks.forEach((l) => l.classList.remove('current'));
            link.classList.add('current');

            renderItems(target === 'all' ? 'all' : target);
        });
    });

    loadGallery();
});

