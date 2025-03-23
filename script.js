let currentIndex = 0;
const cards = document.querySelectorAll('.tariff');

function showCard(index) {
    const isMobile = window.innerWidth <= 768;
    const cardsToShow = isMobile ? 1 : 3;

    cards.forEach((card, i) => {
        if (i >= index && i < index + cardsToShow) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

function nextCard() {
    const isMobile = window.innerWidth <= 768;
    const cardsToShow = isMobile ? 1 : 3;

    if (currentIndex + cardsToShow < cards.length) {
        currentIndex += 1;
        showCard(currentIndex);
    }
}

function prevCard() {
    if (currentIndex > 0) {
        currentIndex -= 1;
        showCard(currentIndex);
    }
}

function selectTariff(tariff, discount, description) {
    document.getElementById("tariff").value = `${tariff} - ${discount} (${description})`;
}

function submitForm(event) {
    event.preventDefault();
    const modal = document.getElementById('successModal');
    modal.style.display = 'flex';

    // Закрытие модального окна через 3 секунды
    setTimeout(() => {
        modal.style.display = 'none';
    }, 3000);
}

// Закрытие модального окна при клике на крестик
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('successModal').style.display = 'none';
});

// Показываем первые карточки при загрузке страницы
showCard(currentIndex);
