document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const track = document.getElementById('carouselTrack');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('carouselDots');
    const rotationHint = document.getElementById('rotationHint');

    let currentIndex = 0;
    let elevatedSlide = null; // Currently elevated slide for rotation
    const totalSlides = slides.length;
    const anglePerSlide = 360 / totalSlides; // 30° for 12 slides

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    // Update carousel rotation to show current slide
    function updateCarousel() {
        // Rotate track so current slide faces viewer
        // +90° offset because slides show their edge by default
        const rotation = -currentIndex * anglePerSlide + 90;
        track.style.transform = `rotateY(${rotation}deg)`;

        // Update dot indicators
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // Go to specific slide
    function goToSlide(index) {
        // If a card is elevated, un-elevate it first
        if (elevatedSlide) {
            unElevateCard();
        }
        currentIndex = index;
        updateCarousel();
    }

    // Navigate to next slide
    function nextSlide() {
        if (elevatedSlide) {
            unElevateCard();
        }
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }

    // Navigate to previous slide
    function prevSlide() {
        if (elevatedSlide) {
            unElevateCard();
        }
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }

    // Elevate a card for rotation (anti-collision)
    function elevateCard(slide) {
        // Un-elevate any previously elevated card
        if (elevatedSlide && elevatedSlide !== slide) {
            unElevateCard();
        }

        // Dim all other slides
        slides.forEach(s => {
            if (s !== slide) {
                s.classList.add('dimmed');
            }
        });

        // Elevate this slide
        slide.classList.add('elevated');
        elevatedSlide = slide;
        rotationHint.classList.add('visible');
    }

    // Return elevated card to carousel
    function unElevateCard() {
        if (!elevatedSlide) return;

        // Reset the flip card rotation
        const flipCard = elevatedSlide.querySelector('.flip-card');
        flipCard.setAttribute('data-rotation', '0');

        // Remove elevation and dimming
        slides.forEach(s => {
            s.classList.remove('dimmed');
            s.classList.remove('elevated');
        });

        elevatedSlide = null;
        rotationHint.classList.remove('visible');
    }

    // Rotate the elevated card by 45 degrees
    function rotateElevatedCard() {
        if (!elevatedSlide) return;

        const flipCard = elevatedSlide.querySelector('.flip-card');
        let rotation = parseInt(flipCard.getAttribute('data-rotation')) || 0;
        rotation = (rotation + 45) % 360;
        flipCard.setAttribute('data-rotation', rotation.toString());
    }

    // Event: Click on a slide
    slides.forEach((slide, index) => {
        slide.addEventListener('click', (e) => {
            if (elevatedSlide === slide) {
                // Already elevated - rotate it
                rotateElevatedCard();
            } else if (index === currentIndex) {
                // Front-facing slide clicked - elevate it
                elevateCard(slide);
            } else {
                // Not front-facing - navigate to it
                goToSlide(index);
            }
        });
    });

    // Event: Navigation buttons
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Event: Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elevatedSlide) {
            unElevateCard();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        } else if ((e.key === ' ' || e.key === 'Enter') && elevatedSlide) {
            e.preventDefault();
            rotateElevatedCard();
        } else if (e.key === 'Enter' && !elevatedSlide) {
            // Enter on front slide elevates it
            elevateCard(slides[currentIndex]);
        }
    });

    // Event: Scroll wheel to spin carousel
    let wheelTimeout;
    document.addEventListener('wheel', (e) => {
        if (elevatedSlide) return; // Don't spin when card is elevated

        e.preventDefault();
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            if (e.deltaY > 0 || e.deltaX > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }, 50);
    }, { passive: false });

    // Initialize
    updateCarousel();
});
