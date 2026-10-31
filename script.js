const cards = [...document.querySelectorAll(".audio-card")];
const circumference = 2 * Math.PI * 52;

function resetProgress(card) {
  card.querySelector(".ring-progress").style.strokeDashoffset = circumference;
}

function setProgress(card, audio) {
  const progress = audio.duration ? audio.currentTime / audio.duration : 0;
  card.querySelector(".ring-progress").style.strokeDashoffset =
    circumference * (1 - progress);
}

function stopCard(card) {
  const audio = card.querySelector("audio");
  audio.pause();
  card.classList.remove("is-playing");
  card.querySelector(".audio-button").setAttribute(
    "aria-label",
    `${card.querySelector(".audio-number").textContent} abspielen`,
  );
}

cards.forEach((card) => {
  const audio = card.querySelector("audio");
  const button = card.querySelector(".audio-button");
  const status = card.querySelector(".audio-status");
  const audioSource = card.dataset.audio;
  if (audioSource) {
    if (!audio.querySelector("source")) {
      audio.src = audioSource;
    }
    audio.load();
  }
  resetProgress(card);

  button.addEventListener("click", async () => {
    if (!audioSource) {
      status.textContent = "Audio noch nicht hinterlegt";
      return;
    }

    if (audio.paused) {
      const rowCards = [...card.closest(".audio-row").querySelectorAll(".audio-card")];
      rowCards.forEach((otherCard) => {
        if (otherCard !== card) {
          stopCard(otherCard);
          resetProgress(otherCard);
        }
      });

      try {
        await audio.play();
        card.classList.add("is-playing");
        button.setAttribute(
          "aria-label",
          `${card.querySelector(".audio-number").textContent} pausieren`,
        );
        status.textContent = "";
      } catch (error) {
        console.error(`Audio konnte nicht gestartet werden: ${audioSource}`, error);
        status.textContent =
          error.name === "NotSupportedError"
            ? "Audioformat wird nicht unterstützt"
            : "Audio konnte nicht gestartet werden";
      }
    } else {
      audio.pause();
      card.classList.remove("is-playing");
      button.setAttribute(
        "aria-label",
        `${card.querySelector(".audio-number").textContent} abspielen`,
      );
    }
  });

  audio.addEventListener("timeupdate", () => setProgress(card, audio));
  audio.addEventListener("ended", () => {
    stopCard(card);
    resetProgress(card);
  });
  audio.addEventListener("error", () => {
    if (audioSource) {
      status.textContent =
        audio.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
          ? "Audioformat wird nicht unterstützt"
          : "Audio konnte nicht geladen werden";
    }
  });
});
