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

    document.querySelectorAll('.publicatie-cover img').forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('open');
        document.body.classList.add('menu-open');
      });
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target !== lightboxImg) {
        lightbox.classList.remove('open');
        document.body.classList.remove('menu-open');
      }
    });

    document.querySelector('.lightbox-close').addEventListener('click', () => {
      lightbox.classList.remove('open');
      document.body.classList.remove('menu-open');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        lightbox.classList.remove('open');
        document.body.classList.remove('menu-open');
      }
    });
  }
});
