/**
 * AURA DERMATOLOGY & AESTHETIC INSTITUTE - CORE SCRIPT
 * High performance, interactive features, animations and validation
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize AOS (Animate on Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
      delay: 50
    });
  }

  // 2. Sticky Navbar scroll effect & active section highlighter
  const navbar = document.querySelector('.main-navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const btnScrollTop = document.getElementById('btnScrollTop');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    // Navbar style change
    if (scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Back to top button
    if (btnScrollTop) {
      if (scrollY > 500) {
        btnScrollTop.classList.add('show');
      } else {
        btnScrollTop.classList.remove('show');
      }
    }

    // Scrollspy active state
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  // Scroll to top button action
  if (btnScrollTop) {
    btnScrollTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 3. Counter Animation for Statistics
  const counters = document.querySelectorAll('.counter-val');
  let countersStarted = false;

  function runCounters() {
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const isDecimal = counter.getAttribute('data-decimal') === 'true';
      const duration = 2000; // ms
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing: easeOutExpo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = ease * target;

        if (isDecimal) {
          counter.textContent = currentVal.toFixed(1);
        } else {
          counter.textContent = Math.floor(currentVal).toLocaleString();
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          if (isDecimal) {
            counter.textContent = target.toFixed(1);
          } else {
            counter.textContent = target.toLocaleString();
          }
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  const statsSection = document.querySelector('.quick-metrics-bar') || document.querySelector('.why-choose-section');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;
          runCounters();
        }
      });
    }, { threshold: 0.2 });

    observer.observe(statsSection);
  }

  // 4. Interactive Before & After Comparison Slider
  const comparisonContainer = document.querySelector('.comparison-container');
  if (comparisonContainer) {
    const beforeImage = comparisonContainer.querySelector('.comparison-image-before');
    const sliderHandle = comparisonContainer.querySelector('.comparison-slider-handle');
    let isDragging = false;

    function moveSlider(x) {
      const rect = comparisonContainer.getBoundingClientRect();
      let position = ((x - rect.left) / rect.width) * 100;
      if (position < 0) position = 0;
      if (position > 100) position = 100;

      beforeImage.style.width = `${position}%`;
      sliderHandle.style.left = `${position}%`;
    }

    sliderHandle.addEventListener('mousedown', () => { isDragging = true; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    comparisonContainer.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      moveSlider(e.clientX);
    });

    // Touch events for mobile
    sliderHandle.addEventListener('touchstart', () => { isDragging = true; }, { passive: true });
    window.addEventListener('touchend', () => { isDragging = false; });
    comparisonContainer.addEventListener('touchmove', (e) => {
      if (!isDragging || !e.touches[0]) return;
      moveSlider(e.touches[0].clientX);
    }, { passive: true });
  }

  // 5. Service Category Filter
  const filterBtns = document.querySelectorAll('.service-filter-btn');
  const serviceCards = document.querySelectorAll('.service-item-wrapper');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      serviceCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // 6. Interactive Appointment Booking Forms (In-page and Modal)
  const formsToHandle = [
    document.getElementById('appointmentFormHero'),
    document.getElementById('mainAppointmentForm'),
    document.getElementById('modalAppointmentForm')
  ].filter(Boolean);

  const bookingToastEl = document.getElementById('bookingToast');
  const toastBody = document.getElementById('toastMessageBody');
  let bsToast = null;
  if (bookingToastEl && typeof bootstrap !== 'undefined') {
    bsToast = new bootstrap.Toast(bookingToastEl, { delay: 6000 });
  }

  formsToHandle.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Show loading spinner
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-2"></i> Processing Consultation...`;

      // Read form inputs
      const name = form.querySelector('[name="patient_name"]')?.value || 'Valued Patient';
      const service = form.querySelector('[name="treatment_service"]')?.value || 'Dermatology Consultation';
      const date = form.querySelector('[name="appointment_date"]')?.value || 'Tomorrow';

      // Simulate medical scheduling API call
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-check me-2"></i> Confirmed!`;

        // If inside modal, close it
        const modalParent = form.closest('.modal');
        if (modalParent && typeof bootstrap !== 'undefined') {
          const bsModal = bootstrap.Modal.getInstance(modalParent);
          if (bsModal) bsModal.hide();
        }

        // Show Toast Notification
        if (toastBody) {
          toastBody.innerHTML = `
            <strong>Appointment Request Received!</strong><br>
            Thank you, <b>${name}</b>. Your consultation for <b>${service}</b> has been prioritized. Our medical coordinator will reach out shortly.
          `;
        }
        if (bsToast) bsToast.show();

        // Reset button and form
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          form.reset();
          form.classList.remove('was-validated');
        }, 2500);

      }, 1200);
    });
  });

  // 7. Newsletter Subscription Form
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      if (input && input.value) {
        if (toastBody) {
          toastBody.innerHTML = `<strong>Welcome to Aura VIP Skincare Club!</strong><br>You are now subscribed to exclusive clinical tips and seasonal treatment offers.`;
        }
        if (bsToast) bsToast.show();
        newsletterForm.reset();
      }
    });
  }

  // 8. Service Details Modal Data Population
  const serviceDetailModalEl = document.getElementById('serviceDetailModal');
  if (serviceDetailModalEl) {
    const serviceDetails = {
      'stretch-marks': {
        title: 'Stretch Marks & Scar Resurfacing',
        tag: 'Laser & Subcision',
        image: 'https://images.unsplash.com/photo-1512290900672-1f55b9227181?auto=format&fit=crop&w=800&q=80',
        description: 'Our medical scar revision protocol unites fractional CO2 ablative laser technology, subcision, and RF microneedling to rebuild fragmented collagen and dermal elastin. Effectively treats post-acne boxcar scars, surgical scars, and post-pregnancy striae.',
        duration: '45 - 60 minutes',
        downtime: '2 - 4 days mild redness',
        sessions: '3 to 5 sessions recommended',
        benefits: ['Deep collagen remodeling', 'Smoothing of deep textural irregularities', 'Safe on Fitzpatrick skin types I-V']
      },
      'dermal-fillers': {
        title: 'Precision Dermal Fillers',
        tag: 'Injectables & Facial Sculpting',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        description: 'US-FDA approved hyaluronic acid gels (Juvederm®, Restylane®) injected with micro-cannulas for supreme comfort and natural facial balance. Restore volume to mid-face, refine lip contours, and define structural jawline contours.',
        duration: '30 - 45 minutes',
        downtime: 'Immediate return to activities',
        sessions: 'Single session (lasts 12-18 months)',
        benefits: ['Natural, subtle rejuvenation', 'Reversible hyaluronic acid formulas', 'Zero surgical downtime']
      },
      'hair-prp': {
        title: 'Hair Loss & PRP Follicle Restoration',
        tag: 'Regenerative Trichology',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        description: 'Concentrated autologous Platelet-Rich Plasma (PRP) enriched with growth factors and exosome biostimulators directly micro-injected into thinning scalp regions. Awakens dormant follicles, slows androgenetic alopecia, and thickens hair caliber.',
        duration: '45 minutes',
        downtime: 'None (wash hair within 24h)',
        sessions: '4 initial sessions spaced 1 month apart',
        benefits: ['100% natural autologous treatment', 'Clinically proven follicle density enhancement', 'Suitable for both men and women']
      },
      'acne-treatment': {
        title: 'Clinical Acne & Clarifying Protocol',
        tag: 'Medical Dermatology',
        image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80',
        description: 'A multi-modal dermatological approach targeting P. acnes bacteria, hyperkeratinization, and sebaceous overproduction. Includes medical salicylic/Jessner peels, targeted blue-light photodynamic therapy, and barrier repair prescriptions.',
        duration: '40 minutes',
        downtime: 'Mild peeling for 48 hours',
        sessions: '3 to 6 sessions customized by severity',
        benefits: ['Stops active cystic inflammation', 'Prevents permanent post-acne scarring', 'Unclogs deep micro-comedones']
      },
      'laser-therapy': {
        title: 'Advanced Medical Laser Therapy',
        tag: 'Picosecond & Nd:YAG Laser',
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
        description: 'State-of-the-art dual-wavelength laser systems targeting stubborn melasma, sun spots, vascular spider veins, and uneven skin pigmentation. Precision thermal pulses disintegrate pigment particles while sparing surrounding healthy skin.',
        duration: '30 minutes',
        downtime: 'Minimal (light sun protection required)',
        sessions: '2 to 4 sessions for optimal luminosity',
        benefits: ['Clears hyperpigmentation & melasma', 'Refines large pores & texture', 'Gentle with advanced cooling contact']
      },
      'skin-rejuvenation': {
        title: 'Hydra-Infusion & Skin Rejuvenation',
        tag: 'Medical Aesthetics',
        image: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80',
        description: 'Vortex-fusion medical facial infusing antioxidant peptides, multimolecular hyaluronic acid, and brightening botanicals. Deeply purges congested pores while replenishing the lipid barrier for an instant clinical red-carpet glow.',
        duration: '50 minutes',
        downtime: 'Zero downtime (instant glow)',
        sessions: 'Monthly maintenance or pre-event',
        benefits: ['Immediate radiant clinical glow', 'Intense cellular hydration', 'Softens fine lines and texture']
      }
    };

    document.querySelectorAll('[data-service-key]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = btn.getAttribute('data-service-key');
        const data = serviceDetails[key];
        if (!data) return;

        document.getElementById('modalServiceTitle').textContent = data.title;
        document.getElementById('modalServiceTag').textContent = data.tag;
        document.getElementById('modalServiceImg').src = data.image;
        document.getElementById('modalServiceDesc').textContent = data.description;
        document.getElementById('modalServiceDuration').textContent = data.duration;
        document.getElementById('modalServiceDowntime').textContent = data.downtime;
        document.getElementById('modalServiceSessions').textContent = data.sessions;

        const benefitsList = document.getElementById('modalServiceBenefits');
        benefitsList.innerHTML = '';
        data.benefits.forEach(b => {
          const li = document.createElement('li');
          li.className = 'd-flex align-items-center gap-2 mb-2 text-dark font-weight-500';
          li.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i> ${b}`;
          benefitsList.appendChild(li);
        });

        // Set service in the booking form dropdown when clicking book in modal
        const bookBtnInModal = document.getElementById('modalBookServiceBtn');
        if (bookBtnInModal) {
          bookBtnInModal.setAttribute('data-preselect', data.title);
        }

        const modal = new bootstrap.Modal(serviceDetailModalEl);
        modal.show();
      });
    });
  }

  // Pre-fill service dropdown if user clicked "Book Treatment" from service card
  document.querySelectorAll('[data-book-service]').forEach(btn => {
    btn.addEventListener('click', () => {
      const serviceName = btn.getAttribute('data-book-service');
      const serviceSelects = document.querySelectorAll('select[name="treatment_service"]');
      serviceSelects.forEach(select => {
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].text.toLowerCase().includes(serviceName.toLowerCase()) ||
              select.options[i].value.toLowerCase().includes(serviceName.toLowerCase())) {
            select.selectedIndex = i;
            break;
          }
        }
      });
    });
  });

  // Set minimum date for appointment pickers to today
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split('T')[0];
  dateInputs.forEach(input => {
    input.setAttribute('min', today);
  });
});
