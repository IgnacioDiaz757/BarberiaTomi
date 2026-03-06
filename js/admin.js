'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error('Supabase client no configurado.');
        return;
    }

    const loginSection = document.getElementById('admin-login');
    const loginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-submit-btn');
    const logoutBtn = document.getElementById('logout-btn');

    const panelSection = document.getElementById('admin-panel');
    const uploadForm = document.getElementById('admin-upload-form');
    const uploadMsg = document.getElementById('upload-message');
    const uploadBtn = document.getElementById('upload-submit-btn');

    const itemsGrid = document.getElementById('admin-items-grid');
    const itemsEmpty = document.getElementById('admin-items-empty');
    const itemsError = document.getElementById('admin-items-error');

    async function checkSessionOnLoad() {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error(error);
            return;
        }
        if (data.session) {
            enterPanel();
        }
    }

    function enterPanel() {
        loginSection.style.display = 'none';
        panelSection.style.display = '';
        logoutBtn.style.display = 'inline-flex';
        loadItems();
        loadHeroSlides();
    }

    async function handleLogin(event) {
        event.preventDefault();
        loginError.style.display = 'none';
        loginBtn.disabled = true;
        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-password').value;

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        loginBtn.disabled = false;

        if (error) {
            console.error(error);
            loginError.textContent = 'Error al iniciar sesión. Verificá email y contraseña.';
            loginError.style.display = 'block';
            return;
        }

        if (data.session) {
            enterPanel();
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        panelSection.style.display = 'none';
        logoutBtn.style.display = 'none';
        loginSection.style.display = '';
    }

    async function handleUpload(event) {
        event.preventDefault();
        uploadMsg.style.display = 'none';
        itemsError.style.display = 'none';

        const fileInput = document.getElementById('media-file');
        const titleInput = document.getElementById('media-title');
        const descriptionInput = document.getElementById('media-description');
        const categorySelect = document.getElementById('media-category');

        const file = fileInput.files[0];
        if (!file) {
            uploadMsg.textContent = 'Seleccioná un archivo.';
            uploadMsg.className = 'admin-alert admin-alert--error';
            uploadMsg.style.display = 'block';
            return;
        }

        uploadBtn.disabled = true;

        const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
        const ext = file.name.split('.').pop();
        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const storagePath = uniqueName;

        const { error: uploadError } = await supabase.storage.from('gallery').upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

        if (uploadError) {
            console.error(uploadError);
            uploadMsg.textContent = 'Error al subir el archivo a Supabase Storage.';
            uploadMsg.className = 'admin-alert admin-alert--error';
            uploadMsg.style.display = 'block';
            uploadBtn.disabled = false;
            return;
        }

        const { data: publicData } = supabase.storage.from('gallery').getPublicUrl(storagePath);
        const publicUrl = publicData?.publicUrl;

        const { error: insertError } = await supabase.from('gallery_items').insert({
            title: titleInput.value || null,
            description: descriptionInput.value || null,
            category: categorySelect.value,
            media_type: mediaType,
            media_url: publicUrl,
            storage_path: storagePath,
        });

        uploadBtn.disabled = false;

        if (insertError) {
            console.error(insertError);
            uploadMsg.textContent = 'El archivo se subió, pero ocurrió un error al guardar el registro.';
            uploadMsg.className = 'admin-alert admin-alert--error';
            uploadMsg.style.display = 'block';
            return;
        }

        uploadMsg.textContent = 'Elemento agregado a la galería correctamente.';
        uploadMsg.className = 'admin-alert admin-alert--info';
        uploadMsg.style.display = 'block';
        uploadForm.reset();

        loadItems();
    }

    async function loadItems() {
        itemsGrid.innerHTML = '';
        itemsEmpty.style.display = 'none';
        itemsError.style.display = 'none';

        const { data, error } = await supabase
            .from('gallery_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            itemsError.textContent = 'No se pudieron cargar los elementos de la galería.';
            itemsError.style.display = 'block';
            return;
        }

        if (!data || data.length === 0) {
            itemsEmpty.style.display = 'block';
            return;
        }

        data.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'admin-item-card';
            card.dataset.id = item.id;
            card.dataset.storagePath = item.storage_path || '';

            const media = document.createElement('div');
            media.className = 'admin-item-media';

            if (item.media_type === 'video') {
                const video = document.createElement('video');
                video.src = item.media_url;
                video.controls = true;
                video.playsInline = true;
                media.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = item.media_url;
                img.alt = item.title || 'Elemento de galería';
                media.appendChild(img);
            }

            const body = document.createElement('div');
            body.className = 'admin-item-body';

            const title = document.createElement('div');
            title.className = 'admin-item-title';
            title.textContent = item.title || '(Sin título)';

            const meta = document.createElement('div');
            meta.className = 'admin-item-meta';
            meta.innerHTML = `<span class="admin-badge">${item.media_type === 'video' ? 'VIDEO' : 'IMAGEN'}</span> · ${
                item.category || 'sin categoría'
            }`;

            const desc = document.createElement('div');
            desc.textContent = item.description || '';

            const actions = document.createElement('div');
            actions.className = 'admin-item-actions';

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'admin-btn';
            deleteBtn.style.padding = '6px 12px';
            deleteBtn.style.fontSize = '12px';
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.addEventListener('click', () => handleDeleteItem(item.id, item.storage_path, card));

            actions.appendChild(deleteBtn);

            body.appendChild(title);
            body.appendChild(meta);
            if (item.description) {
                body.appendChild(desc);
            }
            body.appendChild(actions);

            card.appendChild(media);
            card.appendChild(body);
            itemsGrid.appendChild(card);
        });
    }

    async function handleDeleteItem(id, storagePath, cardEl) {
        if (!window.confirm('¿Eliminar este elemento de la galería?')) return;

        if (storagePath) {
            await supabase.storage.from('gallery').remove([storagePath]);
        }

        const { error } = await supabase.from('gallery_items').delete().eq('id', id);
        if (error) {
            console.error(error);
            itemsError.textContent = 'Ocurrió un error al eliminar el elemento.';
            itemsError.style.display = 'block';
            return;
        }

        if (cardEl && cardEl.parentNode) {
            cardEl.parentNode.removeChild(cardEl);
        }
    }

    // --- Hero carousel ---
    const heroForm = document.getElementById('admin-hero-form');
    const heroMsg = document.getElementById('hero-message');
    const heroSubmitBtn = document.getElementById('hero-submit-btn');
    const heroGrid = document.getElementById('hero-items-grid');
    const heroEmpty = document.getElementById('hero-items-empty');
    const heroError = document.getElementById('hero-items-error');

    async function loadHeroSlides() {
        if (!heroGrid) return;
        heroGrid.innerHTML = '';
        if (heroEmpty) heroEmpty.style.display = 'none';
        if (heroError) heroError.style.display = 'none';

        const { data, error } = await supabase
            .from('hero_slides')
            .select('*')
            .order('position', { ascending: true });

        if (error) {
            console.error(error);
            if (heroError) {
                heroError.textContent = 'No se pudieron cargar las imágenes del carrusel.';
                heroError.style.display = 'block';
            }
            return;
        }

        if (!data || data.length === 0) {
            if (heroEmpty) heroEmpty.style.display = 'block';
            return;
        }

        data.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'admin-item-card';
            card.dataset.id = item.id;
            card.dataset.storagePath = item.storage_path || '';

            const media = document.createElement('div');
            media.className = 'admin-item-media';
            const img = document.createElement('img');
            img.src = item.image_url;
            img.alt = 'Slide carrusel';
            media.appendChild(img);

            const body = document.createElement('div');
            body.className = 'admin-item-body';
            const meta = document.createElement('div');
            meta.className = 'admin-item-meta';
            meta.textContent = 'Posición ' + (item.position + 1);
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'admin-btn';
            deleteBtn.style.padding = '6px 12px';
            deleteBtn.style.fontSize = '12px';
            deleteBtn.style.marginTop = '8px';
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.addEventListener('click', () => handleDeleteHeroSlide(item.id, item.storage_path, card));

            body.appendChild(meta);
            body.appendChild(deleteBtn);
            card.appendChild(media);
            card.appendChild(body);
            heroGrid.appendChild(card);
        });
    }

    async function handleHeroUpload(event) {
        event.preventDefault();
        if (!heroForm) return;
        heroMsg.style.display = 'none';
        if (heroError) heroError.style.display = 'none';

        const fileInput = document.getElementById('hero-file');
        const file = fileInput?.files[0];
        if (!file) {
            heroMsg.textContent = 'Seleccioná una imagen.';
            heroMsg.className = 'admin-alert admin-alert--error';
            heroMsg.style.display = 'block';
            return;
        }

        heroSubmitBtn.disabled = true;
        const ext = file.name.split('.').pop();
        const uniqueName = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage.from('gallery').upload(uniqueName, file, {
            cacheControl: '3600',
            upsert: false,
        });

        if (uploadError) {
            console.error(uploadError);
            heroMsg.textContent = 'Error al subir la imagen.';
            heroMsg.className = 'admin-alert admin-alert--error';
            heroMsg.style.display = 'block';
            heroSubmitBtn.disabled = false;
            return;
        }

        const { data: publicData } = supabase.storage.from('gallery').getPublicUrl(uniqueName);
        const publicUrl = publicData?.publicUrl;

        const { data: maxPos } = await supabase.from('hero_slides').select('position').order('position', { ascending: false }).limit(1).maybeSingle();
        const nextPosition = (maxPos?.position ?? -1) + 1;

        const { error: insertError } = await supabase.from('hero_slides').insert({
            image_url: publicUrl,
            storage_path: uniqueName,
            position: nextPosition,
        });

        heroSubmitBtn.disabled = false;
        if (insertError) {
            console.error(insertError);
            heroMsg.textContent = 'Error al guardar el slide en la base de datos.';
            heroMsg.className = 'admin-alert admin-alert--error';
            heroMsg.style.display = 'block';
            return;
        }

        heroMsg.textContent = 'Imagen agregada al carrusel correctamente.';
        heroMsg.className = 'admin-alert admin-alert--info';
        heroMsg.style.display = 'block';
        heroForm.reset();
        loadHeroSlides();
    }

    async function handleDeleteHeroSlide(id, storagePath, cardEl) {
        if (!window.confirm('¿Eliminar esta imagen del carrusel?')) return;
        if (storagePath) {
            await supabase.storage.from('gallery').remove([storagePath]);
        }
        const { error } = await supabase.from('hero_slides').delete().eq('id', id);
        if (error) {
            console.error(error);
            if (heroError) {
                heroError.textContent = 'Error al eliminar el slide.';
                heroError.style.display = 'block';
            }
            return;
        }
        if (cardEl && cardEl.parentNode) cardEl.parentNode.removeChild(cardEl);
    }

    if (heroForm) heroForm.addEventListener('submit', handleHeroUpload);

    loginForm.addEventListener('submit', handleLogin);
    uploadForm.addEventListener('submit', handleUpload);
    logoutBtn.addEventListener('click', handleLogout);

    checkSessionOnLoad();
});

