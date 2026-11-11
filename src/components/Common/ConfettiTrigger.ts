import confetti from 'canvas-confetti';

export function triggerRomanticConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#F8C8DC', '#E98AB3', '#DCCBFF', '#FFE0CC', '#FFF1F7', '#FF69B4', '#FFD700']
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

export function triggerHeartBurst(originX = 0.5, originY = 0.5) {
  confetti({
    particleCount: 40,
    spread: 70,
    origin: { x: originX, y: originY },
    colors: ['#E98AB3', '#F8C8DC', '#FF3377'],
    shapes: ['circle'],
    scalar: 1.1,
    ticks: 120
  });
}
