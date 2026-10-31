/**
 * CI/CD in Action - 15-Slide Presentation Deck Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const totalSlides = slides.length;
  let currentSlide = 1;

  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const slideCounter = document.getElementById('slide-counter');
  const progressBar = document.getElementById('deck-progress-bar');
  const notesDrawer = document.getElementById('notes-drawer');
  const notesContent = document.getElementById('notes-content');
  const toggleNotesBtn = document.getElementById('toggle-notes-btn');
  const closeNotesBtn = document.getElementById('close-notes-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  // Parse initial hash (e.g. #3)
  if (window.location.hash) {
    const num = parseInt(window.location.hash.replace('#', ''), 10);
    if (!isNaN(num) && num >= 1 && num <= totalSlides) {
      currentSlide = num;
    }
  }

  function showSlide(index) {
    if (index < 1) index = 1;
    if (index > totalSlides) index = totalSlides;

    currentSlide = index;
    window.location.hash = '#' + currentSlide;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i + 1 === currentSlide);
    });

    // Update Counter & Progress
    slideCounter.textContent = `${String(currentSlide).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
    progressBar.style.width = `${(currentSlide / totalSlides) * 100}%`;

    // Button states
    prevBtn.disabled = currentSlide === 1;
    nextBtn.disabled = currentSlide === totalSlides;
    prevBtn.style.opacity = currentSlide === 1 ? '0.5' : '1';
    nextBtn.style.opacity = currentSlide === totalSlides ? '0.5' : '1';

    // Update Speaker Notes
    const activeSlideEl = slides[currentSlide - 1];
    if (activeSlideEl && notesContent) {
      const notes = activeSlideEl.getAttribute('data-notes') || 'No notes for this slide.';
      notesContent.innerHTML = `<p>${notes}</p>`;
    }
  }

  function nextSlide() {
    if (currentSlide < totalSlides) {
      showSlide(currentSlide + 1);
    }
  }

  function prevSlide() {
    if (currentSlide > 1) {
      showSlide(currentSlide - 1);
    }
  }

  function toggleNotes() {
    if (notesDrawer) {
      notesDrawer.classList.toggle('open');
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Event Listeners
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (toggleNotesBtn) toggleNotesBtn.addEventListener('click', toggleNotes);
  if (closeNotesBtn) closeNotesBtn.addEventListener('click', toggleNotes);
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        showSlide(1);
        break;
      case 'End':
        e.preventDefault();
        showSlide(totalSlides);
        break;
      case 's':
      case 'S':
        e.preventDefault();
        toggleNotes();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
    }
  });

  // Touch Swipe navigation for mobile
  let touchStartX = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  }, { passive: true });

  // Initial render
  showSlide(currentSlide);
});
