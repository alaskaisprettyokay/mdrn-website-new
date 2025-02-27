// JavaScript para controlar el reproductor de audio y hacer los círculos audio-reactivos
document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('audio');
    const playPauseButton = document.getElementById('play-pause');
    const stopButton = document.getElementById('stop');
    const circles = document.querySelectorAll('.circle');
    const sections = document.querySelectorAll('.content-section');
    const background = document.querySelector('.background');
    const mainContent = document.querySelector('.main-content');
    const pageContainer = document.querySelector('.page-container');
    const container2 = document.querySelector('.container2');

    let audioContext, analyser, dataArray, source;

    // Definimos los tamaños iniciales de los círculos
    const initialSizes = [35, 40, 40, 30]; // Ajusta estos valores según tus preferencias

    function setupAudioContext() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
    }

    function animateCircles() {
        analyser.getByteFrequencyData(dataArray);

        // Definir rangos de frecuencias para cada círculo
        const frequencyRanges = [
            { start: 0, end: 10 },    // Bajas frecuencias
            { start: 11, end: 30 },   // Medias-bajas frecuencias
            { start: 31, end: 60 },   // Medias-altas frecuencias
            { start: 61, end: 100 }   // Altas frecuencias
        ];

        circles.forEach((circle, index) => {
            const range = frequencyRanges[index];
            let sum = 0;
            for (let i = range.start; i <= range.end; i++) {
                sum += dataArray[i];
            }
            const average = sum / (range.end - range.start + 1);
            const size = (average / 255) * 30 + initialSizes[index]; // Ajustar el tamaño del círculo
            circle.style.width = `${size}vmin`;
            circle.style.height = `${size}vmin`;
        });

        requestAnimationFrame(animateCircles);
    }

    playPauseButton.addEventListener('click', function() {
        if (audio.paused) {
            if (!audioContext) {
                setupAudioContext();
                animateCircles();
            }
            audio.play();
            playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
            playPauseButton.classList.add('playing');
        } else {
            audio.pause();
            playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
            playPauseButton.classList.remove('playing');
        }
    });

    stopButton.addEventListener('click', function() {
        audio.pause();
        audio.currentTime = 0;
        playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        // Restauramos los círculos a sus tamaños iniciales
        circles.forEach((circle, index) => {
            circle.style.width = `${initialSizes[index]}vmin`;
            circle.style.height = `${initialSizes[index]}vmin`;
        });
    });

    // Asegúrate de que el audio se reproduzca en bucle
    audio.addEventListener('ended', function() {
        audio.currentTime = 0;
        audio.play();
    });

    // Inicializamos los círculos con sus tamaños iniciales
    circles.forEach((circle, index) => {
        circle.style.width = `${initialSizes[index]}vmin`;
        circle.style.height = `${initialSizes[index]}vmin`;
    });

    const form = document.getElementById('email-form');
    const input = document.getElementById('email-input');
    const button = document.getElementById('send-button');
    const confirmationText = document.getElementById('confirmation-text');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Animar la desaparición del input y el botón
        input.classList.add('shrink');
        button.classList.add('shrink');

        // Esperar a que termine la animación de desaparición
        setTimeout(() => {
            // Ocultar completamente el input y el botón
            input.style.display = 'none';
            button.style.display = 'none';

            // Mostrar y animar el texto de confirmación
            confirmationText.classList.remove('hidden');
            confirmationText.style.opacity = '1';
            confirmationText.classList.add('typing');
        }, 500);

        // Submit the form
        form.submit();
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            console.log('Entry:', entry); // Log entry details
            if (entry.isIntersecting) {
                console.log('Container2 is visible'); // Log when container2 becomes visible
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once it's visible
            }
        });
    }, {
        threshold: 0.1 // Adjust this value as needed
    });

    sections.forEach(section => {
        observer.observe(section);
    });

    observer.observe(container2);

    // Parallax effect for the background
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        background.style.transform = `translateY(${scrollPosition * 0.5}px)`;

        // Hide main content when scrolling down to new sections
        if (scrollPosition > window.innerHeight / 2) {
            mainContent.classList.add('hidden');
        } else {
            mainContent.classList.remove('hidden');
        }

        // Change background color and reveal text blurb
        if (scrollPosition > window.innerHeight) {
            pageContainer.style.backgroundColor = 'white';
            textBlurbContainer.classList.remove('hidden');
            textBlurbContainer.classList.add('visible');
        } else {
            pageContainer.style.backgroundColor = '';
            textBlurbContainer.classList.add('hidden');
            textBlurbContainer.classList.remove('visible');
        }
    });
});

AOS.init({
    duration: 1000,
    once: false,
    mirror: true,
    offset: 100,  // Reducir el offset para que se active más fácilmente
    anchorPlacement: 'center-center'  // Cambiar el punto de activación
});

// Intersection Observer para las animaciones
const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1
});

// Observar las secciones y sus contenidos
document.querySelectorAll('.feature-section, .feature-content, .text-content, .feature-img').forEach(element => {
    animationObserver.observe(element);
});