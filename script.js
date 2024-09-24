// JavaScript para controlar el reproductor de audio y hacer los círculos audio-reactivos
document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('audio');
    const playPauseButton = document.getElementById('play-pause');
    const stopButton = document.getElementById('stop');
    const circles = document.querySelectorAll('.circle');

    let audioContext, analyser, dataArray, source;

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

        // Asignar diferentes frecuencias a cada círculo
        const frequencies = [5, 15, 25, 35];
        circles.forEach((circle, index) => {
            const frequency = dataArray[frequencies[index]];
            const size = (frequency / 255) * 40 + 30; // Ajustar el tamaño del círculo
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
    });

    // Asegúrate de que el audio se reproduzca en bucle
    audio.addEventListener('ended', function() {
        audio.currentTime = 0;
        audio.play();
    });
});