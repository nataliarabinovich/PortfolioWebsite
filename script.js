const homePage = document.getElementById('homePage');
const contentPages = document.getElementById('contentPages');
const siteNav = document.getElementById('siteNav');
const projectsPage = document.getElementById('projectsPage');
const resumePage = document.getElementById('resumePage');
const otherPage = document.getElementById('otherPage');
const viewProjectsBtn = document.getElementById('viewProjectsBtn');
const navButtons = Array.from(document.querySelectorAll('.nav-button'));
const navIndicator = document.querySelector('.nav-indicator');
const carouselInstances = Array.from(document.querySelectorAll('.project__carousel'));
const shootingStar = document.querySelector('.shooting-star');
const starfield = document.querySelector('.starfield');

function renderStarfield() {
  if (!starfield) return;

  const context = starfield.getContext('2d');
  const width = document.documentElement.clientWidth;
  const height = window.innerHeight;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const starCount = Math.ceil((width * height) / 15000);

  starfield.width = width * pixelRatio;
  starfield.height = height * pixelRatio;
  starfield.style.width = `${width}px`;
  starfield.style.height = `${height}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, width, height);

  for (let index = 0; index < starCount; index += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 0.45 + 0.25;
    const brightness = Math.random() * 0.45 + 0.4;
    const tint = Math.random() > 0.84 ? '190, 215, 255' : '255, 255, 255';

    context.beginPath();
    context.fillStyle = `rgba(${tint}, ${brightness})`;
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
}

renderStarfield();
window.addEventListener('resize', renderStarfield);
if (window.ResizeObserver) {
  new ResizeObserver(renderStarfield).observe(document.body);
}

function updateScrollState() {
  document.body.classList.toggle('has-scrolled', window.scrollY > 0);
}

window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomEdgePoint(edge) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (edge === 'top') return { x: randomBetween(-width * 0.1, width * 1.05), y: -40 };
  if (edge === 'right') return { x: width + 40, y: randomBetween(-height * 0.1, height * 1.05) };
  if (edge === 'bottom') return { x: randomBetween(-width * 0.1, width * 1.05), y: height + 40 };
  return { x: -230, y: randomBetween(-height * 0.1, height * 1.05) };
}

function launchShootingStar() {
  if (!shootingStar || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const edges = ['top', 'right', 'bottom', 'left'];
  const startEdge = edges[Math.floor(Math.random() * edges.length)];
  const endEdges = edges.filter((edge) => edge !== startEdge);
  const endEdge = endEdges[Math.floor(Math.random() * endEdges.length)];
  const start = randomEdgePoint(startEdge);
  const end = randomEdgePoint(endEdge);
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

  shootingStar.style.setProperty('--start-x', `${start.x}px`);
  shootingStar.style.setProperty('--start-y', `${start.y}px`);
  shootingStar.style.setProperty('--end-x', `${end.x}px`);
  shootingStar.style.setProperty('--end-y', `${end.y}px`);
  shootingStar.style.setProperty('--angle', `${angle}deg`);
  shootingStar.style.animation = 'none';
  shootingStar.offsetHeight;
  shootingStar.style.animation = `shooting-star-dart ${Math.round(randomBetween(260, 480))}ms linear forwards`;
}

function scheduleNextShootingStar() {
  if (!shootingStar || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const delay = Math.round(randomBetween(5000, 10000));
  setTimeout(() => {
    launchShootingStar();
    scheduleNextShootingStar();
  }, delay);
}

scheduleNextShootingStar();

const carousels = carouselInstances.map((carousel) => {
  const track = carousel.querySelector('.carousel__track');
  const progress = carousel.querySelector('.carousel__progress-bar');
  const prevButton = carousel.querySelector('.carousel__control--left');
  const nextButton = carousel.querySelector('.carousel__control--right');
  const sources = Array.from(carousel.querySelectorAll('.carousel__sources [data-src]'))
    .map((el) => el.dataset.src)
    .filter(Boolean);

  const images = sources.length
    ? sources
    : [
        'https://via.placeholder.com/520x320.png?text=Image+1',
        'https://via.placeholder.com/520x320.png?text=Image+2',
        'https://via.placeholder.com/520x320.png?text=Image+3',
        'https://via.placeholder.com/520x320.png?text=Image+4'
      ];

  const progressStep = images.length ? 100 / images.length : 25;

  return {
    carousel,
    track,
    progress,
    prevButton,
    nextButton,
    images,
    progressStep,
    index: 0,
    isAnimating: false
  };
});

function buildCarousel(carouselState) {
  if (!carouselState.track) return;
  carouselState.track.innerHTML = '';
  carouselState.images.forEach((src, index) => {
    const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(src);
    if (isVideo) {
      const video = document.createElement('video');
      video.className = 'carousel__slide';
      video.preload = 'metadata';
      video.playsInline = true;
      video.controls = true;
      const sourceEl = document.createElement('source');
      sourceEl.src = src;
      video.appendChild(sourceEl);
      carouselState.track.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.className = 'carousel__slide';
      img.src = src;
      img.alt = `Project carousel image ${index + 1}`;
      carouselState.track.appendChild(img);
    }
  });

  if (carouselState.images.length > 0) {
    const firstSrc = carouselState.images[0];
    const isFirstVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(firstSrc);
    if (isFirstVideo) {
      const videoClone = document.createElement('video');
      videoClone.className = 'carousel__slide';
      videoClone.preload = 'metadata';
      videoClone.playsInline = true;
      videoClone.controls = true;
      const sourceClone = document.createElement('source');
      sourceClone.src = firstSrc;
      videoClone.appendChild(sourceClone);
      carouselState.track.appendChild(videoClone);
    } else {
      const clone = document.createElement('img');
      clone.className = 'carousel__slide';
      clone.src = firstSrc;
      clone.alt = `Project carousel image 1`;
      carouselState.track.appendChild(clone);
    }
  }

  if (carouselState.progress) {
    carouselState.progress.style.width = `${carouselState.progressStep}%`;
    carouselState.progress.style.transform = 'translateX(0%)';
  }
}

function updateCarousel(carouselState) {
  if (!carouselState.track || !carouselState.progress) return;
  carouselState.track.style.transform = `translateX(-${carouselState.index * 100}%)`;
  const progressIndex = carouselState.index === carouselState.images.length ? carouselState.images.length : carouselState.index;
  carouselState.progress.style.transform = `translateX(${progressIndex * 100}%)`;
}

function showPrevImage(carouselState) {
  if (carouselState.isAnimating) return;
  carouselState.index = (carouselState.index - 1 + carouselState.images.length) % carouselState.images.length;
  updateCarousel(carouselState);
}

function showNextImage(carouselState) {
  if (carouselState.isAnimating) return;

  const lastIndex = carouselState.images.length - 1;

  if (carouselState.index === lastIndex) {
    carouselState.index = carouselState.images.length;
    updateCarousel(carouselState);
    carouselState.isAnimating = true;

    const handleTransitionEnd = () => {
      carouselState.track.style.transition = 'none';
      carouselState.progress.style.transition = 'none';
      carouselState.index = 0;
      carouselState.track.style.transform = 'translateX(0%)';
      carouselState.progress.style.transform = 'translateX(-100%)';
      carouselState.track.getBoundingClientRect();

      requestAnimationFrame(() => {
        carouselState.progress.style.transition = '';
        carouselState.progress.style.transform = 'translateX(0%)';

        requestAnimationFrame(() => {
          carouselState.track.style.transition = '';
          carouselState.isAnimating = false;
        });
      });

      carouselState.track.removeEventListener('transitionend', handleTransitionEnd);
    };

    carouselState.track.addEventListener('transitionend', handleTransitionEnd);
  } else {
    carouselState.index += 1;
    updateCarousel(carouselState);
  }
}

carousels.forEach((carouselState) => {
  buildCarousel(carouselState);
  updateCarousel(carouselState);

  const singleSlide = carouselState.images.length <= 1;
  if (singleSlide) {
    if (carouselState.prevButton) {
      carouselState.prevButton.classList.add('hidden');
      carouselState.prevButton.style.display = 'none';
    }
    if (carouselState.nextButton) {
      carouselState.nextButton.classList.add('hidden');
      carouselState.nextButton.style.display = 'none';
    }
    if (carouselState.progress) {
      carouselState.progress.classList.add('hidden');
      carouselState.progress.style.display = 'none';
      carouselState.progress.parentElement?.classList.add('hidden');
    }
  }

  if (!singleSlide) {
    carouselState.prevButton?.addEventListener('click', () => showPrevImage(carouselState));
    carouselState.nextButton?.addEventListener('click', () => showNextImage(carouselState));
  }
});

function updateNavIndicator(activeButton) {
  if (!navIndicator || !activeButton) return;

  const offset = activeButton.offsetLeft;
  navIndicator.style.width = `${activeButton.offsetWidth}px`;
  navIndicator.style.left = `${offset}px`;
}

function setPage(page) {
  contentPages.classList.toggle('page--projects', page === 'projects');
  contentPages.classList.toggle('page--other', page === 'other');

  document.body.classList.toggle('home-page-active', page === 'home');

  if (page === 'home') {
    homePage.classList.remove('hidden');
    contentPages.classList.add('hidden');
    siteNav.classList.add('hidden');
  } else {
    homePage.classList.add('hidden');
    contentPages.classList.remove('hidden');
    siteNav.classList.remove('hidden');
  }

  projectsPage.classList.toggle('hidden', page !== 'projects');
  resumePage.classList.toggle('hidden', page !== 'resume');
  otherPage.classList.toggle('hidden', page !== 'other');

  navButtons.forEach((button) => {
    button.classList.toggle('nav-button--active', button.dataset.page === page);
  });

  const activeButton = navButtons.find((button) => button.dataset.page === page);
  updateNavIndicator(activeButton);

  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

viewProjectsBtn.addEventListener('click', () => {
  setPage('projects');
});

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setPage(button.dataset.page);
  });
});

window.addEventListener('load', () => {
  const activeButton = navButtons.find((button) => button.classList.contains('nav-button--active'));
  updateNavIndicator(activeButton);
});

setPage('home');
