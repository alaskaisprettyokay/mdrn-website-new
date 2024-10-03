// JavaScript para controlar el reproductor de audio y hacer los círculos audio-reactivos
document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('audio');
    const playPauseButton = document.getElementById('play-pause');
    const stopButton = document.getElementById('stop');
    const circles = document.querySelectorAll('.circle');

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
        } else {
            audio.pause();
            playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
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
});