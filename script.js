document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const overlay = document.querySelector('.nav-overlay');

  function openMenu() {
    links.classList.add('open');
    toggle.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    links.classList.remove('open');
    toggle.classList.remove('open');
    overlay.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  toggle.addEventListener('click', () => {
    links.classList.contains('open') ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.btn-submit');
      btn.textContent = 'Versturen...';
      btn.disabled = true;
      try {
        const response = await fetch('https://formspree.io/f/mwvzdrqw', {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          contactForm.style.display = 'none';
          document.getElementById('form-success').style.display = 'block';
        } else {
          btn.textContent = 'Probeer opnieuw';
          btn.disabled = false;
        }
      } catch {
        btn.textContent = 'Probeer opnieuw';
        btn.disabled = false;
      }
    });
  }

  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lightboxImg = document.getElementById('lightbox-img');
    let images = [];
    let currentIndex = 0;

    function openLightbox(index) {
      currentIndex = index;
      lightboxImg.src = images[currentIndex].src;
      lightboxImg.alt = images[currentIndex].alt;
      lightbox.classList.add('open');
      document.body.classList.add('menu-open');
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.classList.remove('menu-open');
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      lightboxImg.src = images[currentIndex].src;
      lightboxImg.alt = images[currentIndex].alt;
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % images.length;
      lightboxImg.src = images[currentIndex].src;
      lightboxImg.alt = images[currentIndex].alt;
    }

    document.querySelectorAll('.publicatie-cover img').forEach((img, i) => {
      images.push(img);
      img.addEventListener('click', () => openLightbox(i));
    });

    document.querySelectorAll('.project-grid .photo-item').forEach((item, i) => {
      item.style.cursor = 'pointer';
      const img = item.querySelector('img');
      images.push(img);
      item.addEventListener('click', () => openLightbox(images.indexOf(img)));
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target !== lightboxImg) closeLightbox();
    });

    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);

    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });
  }
});
