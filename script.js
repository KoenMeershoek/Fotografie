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
});
